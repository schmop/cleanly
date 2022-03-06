import {User} from '@/models/User';

export interface Invite {
    householdId: number,
    householdName: string,
    inviter: User,
}