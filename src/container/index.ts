import { EventProcessor } from '@/checklist/event-processor';
import store from '@/store';
import { AuthClient } from '../client/auth-client';
import { HouseholdClient } from '../client/household-client';
import { SseClient } from '../client/sse-client';
import { TaskClient } from '../client/task-client';

class Container {
    authClient?: AuthClient;
    householdClient?: HouseholdClient;
    sseClient?: SseClient;
    eventProcessor?: EventProcessor;
    taskClient?: TaskClient;

    getAuthClient(): AuthClient {
        this.authClient = this.authClient ?? new AuthClient();

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

    getEventProcessor(): EventProcessor {
        this.eventProcessor = this.eventProcessor ?? new EventProcessor(store, this.getHouseholdClient());

        return this.eventProcessor;
    }

    getTaskClient(): TaskClient {
        this.taskClient = this.taskClient ?? new TaskClient(this.getAuthClient());

        return this.taskClient;
    }
}

export const container = new Container();