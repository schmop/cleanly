import { confirmablePrompt } from '@/alert/prompt';
import { _t } from '@/translation';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

export async function checkAppVersion() {
    const updateInfo = await AppUpdate.getAppUpdateInfo();

    const availableVersionCode = parseInt(updateInfo?.availableVersionCode ?? '0', 10);
    const currentVersionCode = parseInt(updateInfo.currentVersionCode, 10);

    if (availableVersionCode <= currentVersionCode || updateInfo.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
        return;
    }
    if (!(await confirmablePrompt(_t(`A new app version is available. Update now from ${updateInfo.currentVersionName} to ${updateInfo.availableVersionName}?`), _t('Update')))) {
        return;
    }
    try {
        await AppUpdate.performImmediateUpdate();
    } catch (err) {
        await AppUpdate.openAppStore();
    }
}
