/*
 * Generated type guards for "DashboardInfo.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isHousehold } from "./Household.guard";
import { isInvite } from "./Invite.guard";
import { isUserSettings } from "./UserSettings.guard";
import { DashboardInfo } from "./DashboardInfo";

function evaluate(
    isCorrect: boolean,
    varName: string,
    expected: string,
    actual: any
): boolean {
    if (!isCorrect) {
        console.error(
            `${varName} type mismatch, expected: ${expected}, found:`,
            actual
        )
    }
    return isCorrect
}

export function isDashboardInfo(obj: unknown, argumentName: string = "dashboardInfo"): obj is DashboardInfo {
    const typedObj = obj as DashboardInfo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(isUser(typedObj["user"]) as boolean, `${argumentName}["user"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/User\").User", typedObj["user"]) &&
        evaluate(Array.isArray(typedObj["households"]) &&
            typedObj["households"].every((e: any) =>
                isHousehold(e) as boolean
            ), `${argumentName}["households"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Household\").Household[]", typedObj["households"]) &&
        evaluate(Array.isArray(typedObj["invites"]) &&
            typedObj["invites"].every((e: any) =>
                isInvite(e) as boolean
            ), `${argumentName}["invites"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Invite\").Invite[]", typedObj["invites"]) &&
        evaluate(isUserSettings(typedObj["settings"]) as boolean, `${argumentName}["settings"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/UserSettings\").UserSettings", typedObj["settings"])
    )
}
