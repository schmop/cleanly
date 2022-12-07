/*
 * Generated type guards for "Household.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isTask } from "./Task.guard";
import { isHouseholdPrivilege } from "./HouseholdPrivilege.guard";
import { isTodo } from "./Todo.guard";
import { Household } from "./Household";

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

export function isHousehold(obj: unknown, argumentName: string = "household"): obj is Household {
    const typedObj = obj as Household
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["id"] === "number", `${argumentName}["id"]`, "number", typedObj["id"]) &&
        evaluate(typeof typedObj["name"] === "string", `${argumentName}["name"]`, "string", typedObj["name"]) &&
        evaluate(Array.isArray(typedObj["users"]) &&
            typedObj["users"].every((e: any) =>
                isUser(e) as boolean
            ), `${argumentName}["users"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/User\").User[]", typedObj["users"]) &&
        evaluate(Array.isArray(typedObj["tasks"]) &&
            typedObj["tasks"].every((e: any) =>
                isTask(e) as boolean
            ), `${argumentName}["tasks"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Task\").Task[]", typedObj["tasks"]) &&
        evaluate((typeof typedObj["picture"] === "undefined" ||
            typedObj["picture"] === null ||
            typeof typedObj["picture"] === "string"), `${argumentName}["picture"]`, "string | null | undefined", typedObj["picture"]) &&
        evaluate(Array.isArray(typedObj["privileges"]) &&
            typedObj["privileges"].every((e: any) =>
                isHouseholdPrivilege(e) as boolean
            ), `${argumentName}["privileges"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/HouseholdPrivilege\").HouseholdPrivilege[]", typedObj["privileges"]) &&
        evaluate(Array.isArray(typedObj["checklist"]) &&
            typedObj["checklist"].every((e: any) =>
                isTodo(e) as boolean
            ), `${argumentName}["checklist"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Todo\").Todo[]", typedObj["checklist"])
    )
}
