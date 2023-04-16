/*
 * Generated type guards for "index.ts".
 * WARNING: Do not manually change this file.
 */
import { isHousehold } from "../models/Household.guard";
import { isUser } from "../models/User.guard";
import { isInvite } from "../models/Invite.guard";
import { isUserSettings } from "../models/UserSettings.guard";
import { StateInterface } from "./index";

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

export function isState(obj: unknown, argumentName: string = "stateInterface"): obj is StateInterface {
    const typedObj = obj as StateInterface
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["loggedIn"] === "boolean", `${argumentName}["loggedIn"]`, "boolean", typedObj["loggedIn"]) &&
        evaluate(Array.isArray(typedObj["households"]) &&
            typedObj["households"].every((e: any) =>
                isHousehold(e) as boolean
            ), `${argumentName}["households"]`, "import(\"./src/models/Household\").Household[]", typedObj["households"]) &&
        evaluate((typedObj["user"] === null ||
            isUser(typedObj["user"]) as boolean), `${argumentName}["user"]`, "import(\"./src/models/User\").User | null", typedObj["user"]) &&
        evaluate(Array.isArray(typedObj["invites"]) &&
            typedObj["invites"].every((e: any) =>
                isInvite(e) as boolean
            ), `${argumentName}["invites"]`, "import(\"./src/models/Invite\").Invite[]", typedObj["invites"]) &&
        evaluate((typedObj["pageTitle"] === null ||
            typeof typedObj["pageTitle"] === "string"), `${argumentName}["pageTitle"]`, "string | null", typedObj["pageTitle"]) &&
        evaluate((typedObj["viewedHousehold"] === null ||
            typeof typedObj["viewedHousehold"] === "number"), `${argumentName}["viewedHousehold"]`, "number | null", typedObj["viewedHousehold"]) &&
        evaluate(isUserSettings(typedObj["userSettings"]) as boolean, `${argumentName}["userSettings"]`, "import(\"./src/models/UserSettings\").UserSettings", typedObj["userSettings"]) &&
        evaluate((typedObj["stars"] !== null &&
            typeof typedObj["stars"] === "object" ||
            typeof typedObj["stars"] === "function") &&
            Object.entries<any>(typedObj["stars"])
                .every(([key, value]) => (evaluate((value !== null &&
                    typeof value === "object" ||
                    typeof value === "function") &&
                    Object.entries<any>(value)
                        .every(([key, value]) => (evaluate(typeof value === "number", `${argumentName}["stars"] value["${key.toString().replace(/"/g, '\\"')}"]`, "number", value) &&
                            evaluate(typeof key === "number", `${argumentName}["stars"] value (key: "${key.toString().replace(/"/g, '\\"')}")`, "number", key))), `${argumentName}["stars"]["${key.toString().replace(/"/g, '\\"')}"]`, "import(\"/home/schmop/cleanly/src/types/index\").StarsRecord", value) &&
                    evaluate(typeof key === "number", `${argumentName}["stars"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "number", key))), `${argumentName}["stars"]`, "Record<number, import(\"./src/types/index\").StarsRecord>", typedObj["stars"]) &&
        evaluate(typeof typedObj["darkmode"] === "boolean", `${argumentName}["darkmode"]`, "boolean", typedObj["darkmode"])
    )
}
