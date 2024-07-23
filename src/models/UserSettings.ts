import { Language } from "@/translation";

/** @see {isUserSettings} ts-auto-guard:type-guard */
export type UserSettings = {
    notifyTaskDone: boolean,
    notifyTaskDue: boolean,
    notifyInvites: boolean,
    swipeToFinishTasks: boolean,
    language: Language,
}
