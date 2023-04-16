import { UserSettings } from '@/models/UserSettings';
import { AuthClient } from './auth-client';

export class UserClient {
    constructor(private readonly client: AuthClient) {
    }

    async saveUserSettings(settings: UserSettings) {
        const response = await this.client.sendJsonEventually(
            'POST',
            'api/user/settings',
            settings,
        );

        if (response.status !== 200) {
            console.error('Could not save user settings', response.statusText);
            throw new Error('Could not save user settings, ' + response.statusText);
        }
    }
}
