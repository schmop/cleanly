/*
 * Generated type guards for "HouseholdPrivilege.ts".
 * WARNING: Do not manually change this file.
 */
import { PrivilegeLevel, HouseholdPrivilege } from "./HouseholdPrivilege";

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

export function isHouseholdPrivilege(obj: unknown, argumentName: string = "householdPrivilege"): obj is HouseholdPrivilege {
    const typedObj = obj as HouseholdPrivilege
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["user"] === "number", `${argumentName}["user"]`, "number", typedObj["user"]) &&
        evaluate(typeof typedObj["household"] === "number", `${argumentName}["household"]`, "number", typedObj["household"]) &&
        evaluate((typedObj["privilege"] === PrivilegeLevel.USER ||
            typedObj["privilege"] === PrivilegeLevel.MODERATOR ||
            typedObj["privilege"] === PrivilegeLevel.ADMIN), `${argumentName}["privilege"]`, "import(\"./src/models/HouseholdPrivilege\").PrivilegeLevel", typedObj["privilege"])
    )
}
