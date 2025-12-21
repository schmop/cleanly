import { Language } from "@/translation";

/** @see {isUserSettings} ts-auto-guard:type-guard */
export type UserSettings = {
    notifyTaskDone: boolean,
    notifyTaskDue: boolean,
    notifyInvites: boolean,
    notifyNewTransactions: boolean,
    swipeToFinishTasks: boolean,
    language: Language,
}
