import { ColorschemeListener } from '@/app-state/colorscheme-listener';
import { ForegroundListener } from '@/app-state/foreground-listener';
import { TodoEventProcessor } from '@/checklist/todo-event-processor';
import { AuthClient } from '@/client/auth-client';
import { HouseholdClient } from '@/client/household-client';
import { SseClient } from '@/client/sse-client';
import { TaskClient } from '@/client/task-client';
import { UserClient } from '@/client/user-client';
import { InviteEventProcessor } from '@/invite/invite-event-processor';
import { PushService } from '@/push';
import { Store, store } from '@/store';
import { App } from 'vue';
import {
    authClientSymbol,
    colorschemeListenerSymbol,
    foregroundListenerSymbol,
    householdClientSymbol,
    pushSymbol,
    sseClientSymbol,
    taskClientSymbol,
    userClientSymbol
} from './injection-keys';

class Container {
    authClient?: AuthClient;
    householdClient?: HouseholdClient;
    sseClient?: SseClient;
    taskClient?: TaskClient;
    userClient?: UserClient;
    todoEventProcessor?: TodoEventProcessor;
    inviteEventProcessor?: InviteEventProcessor;
    push?: PushService;
    foregroundListener?: ForegroundListener;
    colorschemeListener?: ColorschemeListener;

    /** Installation as Vue plugin */
    install(app: App) {
        app.provide(authClientSymbol, this.getAuthClient());
        app.provide(sseClientSymbol, this.getSseClient());
        app.provide(taskClientSymbol, this.getTaskClient());
        app.provide(householdClientSymbol, this.getHouseholdClient());
        app.provide(userClientSymbol, this.getUserClient());
        app.provide(pushSymbol, this.getPush());
        app.provide(foregroundListenerSymbol, this.getForegroundListener());
        app.provide(colorschemeListenerSymbol, this.getColorschemeListener());
    }

    getStore(): Store {
        return store;
    }

    getAuthClient(): AuthClient {
        return this.authClient = this.authClient ?? new AuthClient(store, this.getPush(), this.getSseClient());
    }

    getHouseholdClient(): HouseholdClient {
        return this.householdClient = this.householdClient ?? new HouseholdClient(this.getAuthClient(), store);
    }

    getUserClient(): UserClient {
        return this.userClient = this.userClient ?? new UserClient(this.getAuthClient());
    }

    getPush(): PushService {
        return this.push = this.push ?? new PushService();
    }

    getSseClient(): SseClient {
        return this.sseClient = this.sseClient ?? new SseClient(this.getTodoEventProcessor(), this.getInviteEventProcessor());
    }

    getTodoEventProcessor(): TodoEventProcessor {
        return this.todoEventProcessor = this.todoEventProcessor ?? new TodoEventProcessor(store);
    }

    getInviteEventProcessor(): InviteEventProcessor {
        return this.inviteEventProcessor = this.inviteEventProcessor ?? new InviteEventProcessor(store);
    }

    getTaskClient(): TaskClient {
        return this.taskClient = this.taskClient ?? new TaskClient(this.getAuthClient(), store);
    }

    getForegroundListener(): ForegroundListener {
        return this.foregroundListener = this.foregroundListener ?? new ForegroundListener(this.getHouseholdClient(), store);
    }

    getColorschemeListener(): ColorschemeListener {
        return this.colorschemeListener = this.colorschemeListener ?? new ColorschemeListener(store);
    }
}

export const container = new Container();
