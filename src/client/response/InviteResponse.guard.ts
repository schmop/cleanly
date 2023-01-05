/*
 * Generated type guards for "InviteResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { isHousehold } from "../../models/Household.guard";
import { InviteResponse } from "./InviteResponse";

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

export function isInviteResponse(obj: unknown, argumentName: string = "inviteResponse"): obj is InviteResponse {
    const typedObj = obj as InviteResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(isHousehold(typedObj["household"]) as boolean, `${argumentName}["household"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Household\").Household", typedObj["household"])
    )
}
