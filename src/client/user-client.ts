import { UserSettings } from '@/models/UserSettings';
import { Store } from '@/store';
import { AuthClient } from './auth-client';

export class UserClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async saveUserSettings(settings: UserSettings) {
        const response = await this.client.sendJson(
            'api/user/settings',
            settings,
            {method: 'POST'},
        );

        if (response.status !== 200) {
            console.error('Could not save user settings', response.statusText);
            throw new Error('Could not save user settings, ' + response.statusText);
        }
    }
}