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
     let message = undefined === context
          ? 'Unknown error'
          : `Unknown error occured while ${context}`;

     if (exception instanceof Error) {
          message = `Error occured while ${context}: ${exception.message}`;
     } else if (typeof exception === 'string') {
          message = `Error occured while ${context}: ${exception}`;
     }

     return error(message);
}

export default {
     info,
     success,
     warning,
     error,
     showThrownError,
};