import { _t } from '@/translation';
import { toastController } from '@ionic/vue';

export async function info(message: string, duration = 5000): Promise<void> {
    const toast = await toastController.create({
        color: 'primary',
        message,
        duration,
        buttons: [
            {
                text: _t('Dismiss'),
                role: 'cancel',
            },
        ],
    });
    return toast.present();
}

export async function success(message: string, duration = 5000): Promise<void> {
    const toast = await toastController.create({
        color: 'success',
        message,
        duration,
        buttons: [
            {
                text: _t('Dismiss'),
                role: 'cancel',
            },
        ],
    });
    return toast.present();
}

export async function warning(message: string, duration = 5000): Promise<void> {
    const toast = await toastController.create({
        color: 'warning',
        message,
        duration,
        buttons: [
            {
                text: _t('Dismiss'),
                role: 'cancel',
            },
        ],
    });
    return toast.present();
}

export async function error(message: string, duration = 5000): Promise<void> {
    const toast = await toastController.create({
        color: 'danger',
        message,
        duration,
        buttons: [
            {
                text: _t('Dismiss'),
                role: 'cancel',
            },
        ],
    });

    return toast.present();
}

export async function showThrownError(exception: unknown, context?: string): Promise<void> {
    console.info(exception);
    let message = undefined === context ? '' : `Error occurred while ${context}: `;

    if (exception instanceof Error) {
        message += exception.message;
    } else if (typeof exception === 'string') {
        message += exception;
    } else {
        message += 'Unknown error';
    }

    console.error(message);

    return error(message);
}

export default {
    info,
    success,
    warning,
    error,
    showThrownError,
};
