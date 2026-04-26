import { _t } from '@/translation';
import { alertController } from '@ionic/vue';
import { TextFieldTypes } from '@ionic/core';

/**
 * @returns {boolean} true when confirmed, false else
 */
export async function confirmablePrompt(header: string, confirmText?: string, message?: string): Promise<boolean> {
    const alert = await alertController.create({
        header: header,
        buttons: [
            {
                text: confirmText ?? _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ],
        message,
    });
    await alert.present();

    return (await alert.onDidDismiss()).role === 'confirm';
}

export type StringPromptOptions = Partial<{ type: TextFieldTypes, value: string }>;

/**
 * @returns {string|false} string when confirmed, false else
 */
export async function stringPrompt(
    header: string,
    message: string,
    inputPlaceholder: string,
    options: StringPromptOptions = {},
): Promise<string|false> {
    const alert = await alertController.create({
        header,
        message,
        inputs: [{
            name: 'text',
            placeholder: inputPlaceholder,
            type: options.type ?? 'text',
            value: options.value,
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
