import {User} from '@/models/User';

/** @see {isInvite} ts-auto-guard:type-guard */
export interface Invite {
    householdId: number,
    householdName: string,
    inviter: User|null,
}