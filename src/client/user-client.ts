import { UserSettings } from '@/models/UserSettings';
import { Store } from '@/store';
import { AuthClient } from './auth-client';

export class UserClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async saveUserSettings(settings: UserSettings) {
        const formData = new FormData();
        formData.append('settings', JSON.stringify(settings));
        const response = await this.client.request('api/user/settings', {
            body: formData,
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not save user settings', response.statusText);
            throw new Error('Could not save user settings, ' + response.statusText);
        }
    }
}