import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { Store, store } from '@/store';
import { App } from 'vue';
import { AuthClient } from '../client/auth-client';
import { HouseholdClient } from '../client/household-client';
import { SseClient } from '../client/sse-client';
import { TaskClient } from '../client/task-client';
import { authClientSymbol, sseClientSymbol, taskClientSymbol, householdClientSymbol } from './injection-keys';

class Container {
    authClient?: AuthClient;
    householdClient?: HouseholdClient;
    sseClient?: SseClient;
    eventProcessor?: TodoEventProcessor;
    taskClient?: TaskClient;

    /** Installation as Vue plugin */
    install(app: App) {
        app.provide(authClientSymbol, this.getAuthClient());
        app.provide(sseClientSymbol, this.getSseClient());
        app.provide(taskClientSymbol, this.getTaskClient());
        app.provide(householdClientSymbol, this.getHouseholdClient());
    }

    getStore(): Store {
        return store;
    }

    getAuthClient(): AuthClient {
        this.authClient = this.authClient ?? new AuthClient(store);

        return this.authClient;
    }
    
    getHouseholdClient(): HouseholdClient {
        this.householdClient = this.householdClient ?? new HouseholdClient(this.getAuthClient(), store);

        return this.householdClient;
    }

    getSseClient(): SseClient {
        this.sseClient = this.sseClient ?? new SseClient(this.getAuthClient(), this.getEventProcessor());

        return this.sseClient;
    }

    getEventProcessor(): TodoEventProcessor {
        this.eventProcessor = this.eventProcessor ?? new TodoEventProcessor(store, this.getHouseholdClient());

        return this.eventProcessor;
    }

    getTaskClient(): TaskClient {
        this.taskClient = this.taskClient ?? new TaskClient(this.getAuthClient(), store);

        return this.taskClient;
    }
}

export const container = new Container();