import { _t } from '@/translation';
import { alertController } from '@ionic/vue';

/**
 * @returns {boolean} true when confirmed, false else
 */
export async function confirmablePrompt(message: string, confirmText?: string): Promise<boolean> {
    const alert = await alertController.create({
        header: message,
        buttons: [
            {
                text: confirmText ?? _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ],
    });
    await alert.present();

    return (await alert.onDidDismiss()).role === 'confirm';
}

/**
 * @returns {string|false} string when confirmed, false else
 */
export async function stringPrompt(header: string, message: string, inputPlaceholder: string): Promise<string|false> {
    const alert = await alertController.create({
        header,
        message,
        inputs: [{
            name: 'text',
            placeholder: inputPlaceholder,
            type: 'url',
        }],
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ],
    });
    await alert.present();
    const alertDismiss = await alert.onDidDismiss<{values: {text: string}}>();
    if (alertDismiss.role !== 'confirm') {
        return false;
    }

    return alertDismiss.data?.values?.text ?? false;
}
