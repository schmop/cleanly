import { ColorschemeListener } from '@/app-state/colorscheme-listener';
import { DashboardRefresher } from "@/app-state/dashboard-refresher";
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
    dashboardRefresherSymbol,
    foregroundListenerSymbol,
    householdClientSymbol,
    pushSymbol,
    sseClientSymbol,
    taskClientSymbol,
    userClientSymbol
} from './injection-keys';
import { FinanceEventProcessor } from "@/components/HouseholdView/FinancesView/finance-event-processor";

class Container {
    private authClient?: AuthClient;
    private householdClient?: HouseholdClient;
    private sseClient?: SseClient;
    private taskClient?: TaskClient;
    private userClient?: UserClient;
    private todoEventProcessor?: TodoEventProcessor;
    private inviteEventProcessor?: InviteEventProcessor;
    private push?: PushService;
    private foregroundListener?: ForegroundListener;
    private colorschemeListener?: ColorschemeListener;
    private dashboardRefresher?: DashboardRefresher;
    private financeEventProcessor?: FinanceEventProcessor;

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
        app.provide(dashboardRefresherSymbol, this.getDashboardRefresher());
    }

    getStore(): Store {
        return store;
    }

    getAuthClient(): AuthClient {
        return this.authClient ??= new AuthClient(store, this.getPush(), this.getSseClient());
    }

    getHouseholdClient(): HouseholdClient {
        return this.householdClient ??= new HouseholdClient(this.getAuthClient(), store);
    }

    getUserClient(): UserClient {
        return this.userClient ??= new UserClient(this.getAuthClient());
    }

    getPush(): PushService {
        return this.push ??= new PushService();
    }

    getSseClient(): SseClient {
        return this.sseClient ??= new SseClient(this.getTodoEventProcessor(), this.getInviteEventProcessor(), this.getFinanceEventProcessor());
    }

    getTodoEventProcessor(): TodoEventProcessor {
        return this.todoEventProcessor ??= new TodoEventProcessor(store);
    }

    getInviteEventProcessor(): InviteEventProcessor {
        return this.inviteEventProcessor ??= new InviteEventProcessor(store);
    }

    getFinanceEventProcessor(): FinanceEventProcessor {
        return this.financeEventProcessor ??= new FinanceEventProcessor(store);
    }

    getTaskClient(): TaskClient {
        return this.taskClient ??= new TaskClient(this.getAuthClient(), store);
    }

    getForegroundListener(): ForegroundListener {
        return this.foregroundListener ??= new ForegroundListener(this.getHouseholdClient(), this.getSseClient(), store);
    }

    getColorschemeListener(): ColorschemeListener {
        return this.colorschemeListener ??= new ColorschemeListener(store);
    }

    getDashboardRefresher(): DashboardRefresher {
        return this.dashboardRefresher ??= new DashboardRefresher(this.getHouseholdClient());
    }
}

export const container = new Container();
