import { HouseholdId, UserId } from '@/types';

/** @see {isHouseholdPrivilege} ts-auto-guard:type-guard */
export interface HouseholdPrivilege {
    user: UserId,
    household: HouseholdId,
    privilege: PrivilegeLevel,
}

export enum PrivilegeLevel {
    USER = 0,
    MODERATOR = 1,
    ADMIN = 2,
}
