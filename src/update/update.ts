import { confirmablePrompt } from '@/alert/prompt';
import { __t, _t } from '@/translation';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

export async function checkAppVersion() {
    const updateInfo = await AppUpdate.getAppUpdateInfo();

    const availableVersionCode = parseInt(updateInfo?.availableVersionCode ?? '0', 10);
    const currentVersionCode = parseInt(updateInfo.currentVersionCode, 10);

    if (availableVersionCode <= currentVersionCode || updateInfo.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
        return;
    }
    if (!(await confirmablePrompt(__t('A new app version is available. Update now from {0} to {1}?', updateInfo.currentVersionName, updateInfo.availableVersionName ?? 'Unknown new version'), _t('Update')))) {
        return;
    }
    try {
        await AppUpdate.performImmediateUpdate();
    } catch (err) {
        await AppUpdate.openAppStore();
    }
}
