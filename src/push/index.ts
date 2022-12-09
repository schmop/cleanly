import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';


export class PushService {
    private pushId: null|string = null;
    private pushIdPromise: null|Promise<void> = null;

    constructor() {
        this.init();
    }

    async init() {
        await this.requestPermissions();
        this.registerListeners();
    }

    async getPushId(): Promise<null|string> {
        await this.pushIdPromise;

        return this.pushId;
    }

    async getDeviceId() {
        return (await Device.getId()).uuid;
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
            PushNotifications.addListener('registration', (token: Token) => {
                console.info('Device registered', token);
                this.pushId = token.value;
                resolve();
            });
            PushNotifications.addListener('registrationError', err => {
                console.error('Registration error: ', err.error);
                reject(err);
            });
        })
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => console.info('Received a notification', notification));
        await PushNotifications.register();
    }
}