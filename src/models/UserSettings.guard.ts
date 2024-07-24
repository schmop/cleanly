/*
 * Generated type guards for "UserSettings.ts".
 * WARNING: Do not manually change this file.
 */
import { UserSettings } from "./UserSettings";

export function isUserSettings(obj: unknown): obj is UserSettings {
    const typedObj = obj as UserSettings
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["notifyTaskDone"] === "boolean" &&
        typeof typedObj["notifyTaskDue"] === "boolean" &&
        typeof typedObj["notifyInvites"] === "boolean" &&
        typeof typedObj["swipeToFinishTasks"] === "boolean" &&
        (typedObj["language"] === "en" ||
            typedObj["language"] === "de" ||
            typedObj["language"] === "schwobi")
    )
}
