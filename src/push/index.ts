import { Device } from '@capacitor/device';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Router } from 'vue-router';
import { watch } from 'vue';
import { Store } from '@/store';
import { Household } from '@/models/Household';
import { PushNotificationData } from '@/push/notification-data';
import { isPushNotificationData } from '@/push/notification-data.guard';


export class PushService {
    private pushId: null|string = null;
    private pushIdPromise: null|Promise<void> = null;
    private pendingAction: null|PushNotificationData = null;
    private isReady = false;

    constructor(
        private readonly store: Store,
        private readonly router: Router,
    ) {
        watch(
            () => this.store.state.households,
            () => this.tryDispatchPending(),
            { deep: false },
        );
        this.init().catch((err) => console.warn(err));
    }

    markReady(): void {
        this.isReady = true;
        this.tryDispatchPending();
    }

    async init() {
        await this.requestPermissions();
        await this.registerListeners();
    }

    async getPushId(): Promise<null|string> {
        await this.pushIdPromise;

        return this.pushId;
    }

    async getDeviceId(): Promise<string> {
        return (await Device.getId()).identifier;
    }

    async requestPermissions() {
        let permissionStatus = await PushNotifications.checkPermissions();

        if (permissionStatus.receive === 'prompt') {
            permissionStatus = await PushNotifications.requestPermissions();
        }

        if (permissionStatus.receive === 'granted') {
            console.info('We have permission to send push notifications');
        } else {
            console.warn('We do not have permission to send push notifications');
        }
    }

    async registerListeners() {
        this.pushIdPromise = new Promise((resolve, reject) => {
            void PushNotifications.addListener('registration', (token: Token) => {
                console.info('Device registered', token);
                this.pushId = token.value;
                resolve();
            });
            void PushNotifications.addListener('registrationError', err => {
                console.error('Registration error: ', err.error);
                reject(new Error(err.error));
            });
        })
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => console.info('Received a notification', notification));
        await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
            const data: unknown = action.notification.data;
            if (!isPushNotificationData(data)) {
                return;
            }
            this.pendingAction = data;
            this.tryDispatchPending();
        });
        await PushNotifications.register();
    }

    private tryDispatchPending(): void {
        if (!this.isReady) {
            return;
        }
        const action = this.pendingAction;
        if (action === null) {
            return;
        }
        if (action.type !== 'invite') {
            const householdId = Number(action.householdId);
            const household = this.store.state.households.find((h: Household) => h.id === householdId);
            if (household === undefined) {
                return;
            }
        }
        this.pendingAction = null;
        void this.dispatch(action);
    }

    private async dispatch(action: PushNotificationData): Promise<void> {
        if (action.type === 'invite') {
            await this.router.push({ name: 'invite-view' });
            return;
        }
        const householdId = Number(action.householdId);
        this.store.viewHousehold(householdId);
        switch (action.type) {
            case 'task_done':
            case 'task_due':
            case 'task_assign':
                await this.router.push({ name: 'tasks' });
                return;
            case 'checklist_update':
                this.store.openChecklist(action.checklistUuid);
                await this.router.push({ name: 'checklist' });
                return;
            case 'finance_transaction':
                await this.router.push({ name: 'finances' });
                return;
        }
    }
}
