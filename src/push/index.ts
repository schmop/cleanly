import { Push, PushObject, PushOptions } from '@awesome-cordova-plugins/push';

declare global {
    let device: {
        /** Get the version of Cordova running on the device. */
        cordova: string;
        /** Indicates that Cordova initialize successfully. */
        available: boolean;
        /**
         * The device.model returns the name of the device's model or product. The value is set
         * by the device manufacturer and may be different across versions of the same product.
         */
        model: string;
        /** Get the device's operating system name. */
        platform: string;
        /** Get the device's Universally Unique Identifier (UUID). */
        uuid: string;
        /** Get the operating system version. */
        version: string;
        /** Get the device's manufacturer. */
        manufacturer: string;
        /** Whether the device is running on a simulator. */
        isVirtual: boolean;
        /** Get the device hardware serial number. */
        serial: string;
    };
}

export class PushService {
    private pushObject: null|PushObject = null;
    private pushId: null|string = null;
    private pushIdPromise: null|Promise<void> = null;

    constructor() {
        this.requestPermissions();
        // to initialize push notifications
        const options: PushOptions = {
            android: {
                forceShow: true,
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'false'
            },
        }
        this.pushObject = Push.init(options);
        this.registerListeners();
    }

    async getPushId(): Promise<null|string> {
        await this.pushIdPromise;

        return this.pushId;
    }

    getDeviceId(): string {
        return device.uuid;
    }

    requestPermissions() {
        Push.hasPermission()
        .then((res: any) => {
            if (res.isEnabled) {
                console.log('We have permission to send push notifications');
            } else {
                console.warn('We do not have permission to send push notifications');
            }
        });
    }

    registerListeners() {
        if (null == this.pushObject) {
            console.error('Tried to register pushlisteners, but no pushobject found!');
            return;
        }
        this.pushIdPromise = new Promise((resolve) => {
            this.pushObject!.on('registration').subscribe((registration: any) => {
                console.log('Device registered', registration);
                resolve();
                if (typeof registration.registrationId !== 'string' || registration.registrationType !== 'FCM') {
                    console.error('Could not retrieve pushId!');
                    return;
                }
                this.pushId = registration.registrationId as string;
            });
        })
        this.pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));
        this.pushObject.on('error').subscribe((error: any) => console.error('Error with Push plugin', error));
    }
}