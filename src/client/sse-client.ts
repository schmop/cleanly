import { AuthClient } from '@/client/auth-client';
import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { InviteEventProcessor } from '@/invite/invite-event-processor';
import { getSseHost } from '@/client/host';

export class SseClient {
    source: EventSource|null;
    retries = 0;
    get HOST() {
        return getSseHost();
    }

    get MAX_RETRIES() {
        return 10;
    }

    get _token() {
        return this.authClient.getToken();
    }

    constructor(
        private authClient: AuthClient,
        private todoEventProcessor: TodoEventProcessor,
        private inviteEventProcessor: InviteEventProcessor,
    ) {
        this.source = null;
    }

    register(force: boolean = false) {
        if (null !== this.source && !force) {
            return;
        }
        /**
          * @link: https://github.com/whatwg/html/issues/2177#issuecomment-293424286
          * You cannot add "Authorization: Bearer <token>" header to EventSources.
          */
        this.source = new EventSource(`${this.HOST}/events?token=${this._token}`);

        this.source.onopen = function () {
            console.info("Connection to server opened.");
        };

        this.source.onmessage = (e: MessageEvent) => {
            const data = JSON.parse(e.data);
            const payload = data.payload;
            switch (data.type) {
                case 'checklist':
                    this.todoEventProcessor.processBatch(payload.events, payload.household_id);
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
