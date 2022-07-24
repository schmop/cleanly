import { AuthClient } from './auth-client';
import { TodoEventProcessor } from '../checklist/todo-event-processor';

export class SseClient {
    source: EventSource|null;
    get HOST() {
        if (process.env.NODE_ENV === 'production') {
            return "https://cleanly.schmoppo.de:3333";
        }
        return "http://127.0.0.1:3334";
    }

    get _token() {
        return this.authClient.getToken();
    }

    constructor(private authClient: AuthClient, private eventProcessor: TodoEventProcessor) {
        this.source = null;
    }

    register() {
        if (null !== this.source) {
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
                    this.eventProcessor.processBatch(payload.events, payload.household_id);
                    break;
            }
        };

        this.source.onerror = function () {
            console.warn("EventSource failed.");
        };
    }
}
