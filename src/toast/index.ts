import {toastController} from '@ionic/vue';

export async function info(message: string, duration = 5000): Promise<void> {
     const toast = await toastController.create({color: 'primary', message, duration});
     return toast.present();
}

export async function success(message: string, duration = 5000): Promise<void> {
     const toast = await toastController.create({color: 'success', message, duration});
     return toast.present();
}

export async function warning(message: string, duration = 5000): Promise<void> {
     const toast = await toastController.create({color: 'warning', message, duration});
     return toast.present();
}

export async function error(message: string, duration = 5000): Promise<void> {
     const toast = await toastController.create({color: 'danger', message, duration});
     return toast.present();
}

export default {
    info,
    success,
    warning,
    error
};