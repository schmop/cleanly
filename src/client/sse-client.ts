import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { getSseHost } from '@/client/host';
import { isEventSourceMessage } from "@/client/sse/EventSourceMessage.guard";
import { InviteEventProcessor } from '@/invite/invite-event-processor';
import { warning } from "@/toast";

export class SseClient {
    source: EventSource|null;
    retries = 0;
    tokenGetter: (() => string|null)|null = null;

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
    }

    setTokenCallback(tokenCallback: () => string|null) {
        this.tokenGetter = tokenCallback;
    }

    register(force: boolean = false) {
        const token = this.tokenGetter?.() ?? null;
        if (null !== this.source && !force || null === token) {
            return;
        }
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
}
