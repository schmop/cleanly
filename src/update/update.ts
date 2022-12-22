import { confirmablePrompt } from '@/alert/prompt';
import { _t } from '@/translation';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

export async function checkAppVersion() {
    const updateInfo = await AppUpdate.getAppUpdateInfo();

    if (updateInfo.availableVersion <= updateInfo.currentVersion || updateInfo.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
        return;
    }
    if (!await confirmablePrompt(_t('A new app version is available. Update now?'), _t('Update'))) {
        return;
    }
    try {
        await AppUpdate.performImmediateUpdate();
    } catch (err) {
        await AppUpdate.openAppStore();
    }
}
