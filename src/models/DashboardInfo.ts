import { Household } from "@/models/Household";
import { Invite } from "@/models/Invite";
import { User } from "@/models/User";
import { UserSettings } from "@/models/UserSettings";

/** @see {isDashboardInfo} ts-auto-guard:type-guard */
export interface DashboardInfo {
    user: User,
    households: Household[],
    invites: Invite[],
    settings: UserSettings,
}