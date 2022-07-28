import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { PushService } from '@/push';
import { Store, store } from '@/store';
import { App } from 'vue';
import { AuthClient } from '../client/auth-client';
import { HouseholdClient } from '../client/household-client';
import { SseClient } from '../client/sse-client';
import { TaskClient } from '../client/task-client';
import { authClientSymbol, sseClientSymbol, taskClientSymbol, householdClientSymbol, pushSymbol } from './injection-keys';

class Container {
    authClient?: AuthClient;
    householdClient?: HouseholdClient;
    sseClient?: SseClient;
    eventProcessor?: TodoEventProcessor;
    taskClient?: TaskClient;
    push?: PushService;

    /** Installation as Vue plugin */
    install(app: App) {
        app.provide(authClientSymbol, this.getAuthClient());
        app.provide(sseClientSymbol, this.getSseClient());
        app.provide(taskClientSymbol, this.getTaskClient());
        app.provide(householdClientSymbol, this.getHouseholdClient());
        app.provide(pushSymbol, this.getPush());
    }

    getStore(): Store {
        return store;
    }

    getAuthClient(): AuthClient {
        return this.authClient = this.authClient ?? new AuthClient(store, this.getPush());
    }
    
    getHouseholdClient(): HouseholdClient {
        return this.householdClient = this.householdClient ?? new HouseholdClient(this.getAuthClient(), store);
    }

    
    getPush(): PushService {
        return this.push = this.push ?? new PushService();
    }

    getSseClient(): SseClient {
        return this.sseClient = this.sseClient ?? new SseClient(this.getAuthClient(), this.getEventProcessor());
    }

    getEventProcessor(): TodoEventProcessor {
        return this.eventProcessor = this.eventProcessor ?? new TodoEventProcessor(store, this.getHouseholdClient());
    }

    getTaskClient(): TaskClient {
        return this.taskClient = this.taskClient ?? new TaskClient(this.getAuthClient(), store);
    }
}

export const container = new Container();