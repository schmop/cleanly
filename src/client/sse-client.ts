import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { getSseHost } from '@/client/host';
import { isEventSourceMessage } from "@/client/sse/EventSourceMessage.guard";
import { ListenerBag } from "@/common/listener-bag";
import { InviteEventProcessor } from '@/invite/invite-event-processor';
import { warning } from "@/toast";

export class SseClient {
    private source: EventSource|null;
    private retries = 0;
    private tokenGetter: (() => string|undefined)|null = null;
    private listenerBag: ListenerBag;

    get HOST() {
        return getSseHost();
    }

    get MAX_RETRIES() {
        return 10;
    }

    constructor(
        private todoEventProcessor: TodoEventProcessor,
        private inviteEventProcessor: InviteEventProcessor,
    ) {
        this.source = null;
        this.listenerBag = new ListenerBag();
    }

    setTokenCallback(tokenCallback: () => string|undefined) {
        this.tokenGetter = tokenCallback;
        this.restart();
    }

    restart() {
        this.retries = 0;
        this.source?.close();
        this.register(true);
    }

    register(force: boolean = false) {
        const token = this.tokenGetter?.() ?? null;
        if (null !== this.source && !force || null === token) {
            return;
        }
        this.registerBrowserConnectivityListeners();
        /**
         * @link: https://github.com/whatwg/html/issues/2177#issuecomment-293424286
         * You cannot add "Authorization: Bearer <token>" header to EventSources.
         */
        this.source = new EventSource(`${this.HOST}/events?token=${token}`);

        this.source.onopen = function () {
            console.info("Connection to server opened.");
        };

        this.source.onmessage = async (e: MessageEvent<string>) => {
            const data: unknown = JSON.parse(e.data);
            if (!isEventSourceMessage(data)) {
                await warning('Live updates received wrong data!');

                return;
            }
            const payload = data.payload;
            switch (data.type) {
                case 'checklist':
                    this.todoEventProcessor.processBatch(payload);
                    break;
                case 'invites':
                    this.inviteEventProcessor.process(payload);
                    break;
            }
        };

        this.source.onerror = (event: Event) => {
            console.warn("EventSource failed.", event);
            this.source?.close();
            this.retries++;
            if (this.retries < this.MAX_RETRIES) {
                this.register(true);
            }
        };
    }

    private registerBrowserConnectivityListeners() {
        this.listenerBag.clear();
        this.listenerBag.add(window, 'online', () => {
            this.restart();
            console.info('Browser thinks we are back online!');
        });
        this.listenerBag.add(window, 'offline', () => {
            this.retries = this.MAX_RETRIES;
            console.warn('Browser thinks we are offline!');
        });
    }
}
