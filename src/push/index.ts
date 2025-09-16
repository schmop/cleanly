import { Device } from '@capacitor/device';
import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';


export class PushService {
    private pushId: null|string = null;
    private pushIdPromise: null|Promise<void> = null;

    constructor() {
        this.init().catch((err) => console.warn(err));
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
        await PushNotifications.register();
    }
}
