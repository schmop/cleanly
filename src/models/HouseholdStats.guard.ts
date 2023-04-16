/*
 * Generated type guards for "HouseholdStats.ts".
 * WARNING: Do not manually change this file.
 */
import { HouseholdStats, TaskStats } from "./HouseholdStats";

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

export function isHouseholdStats(obj: unknown, argumentName: string = "householdStats"): obj is HouseholdStats {
    const typedObj = obj as HouseholdStats
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate((typedObj["durations"] !== null &&
            typeof typedObj["durations"] === "object" ||
            typeof typedObj["durations"] === "function") &&
            Object.entries<any>(typedObj["durations"])
                .every(([key, value]) => (evaluate(isTaskStats(value) as boolean, `${argumentName}["durations"]["${key.toString().replace(/"/g, '\\"')}"]`, "import(\"/home/schmop/cleanly/src/models/HouseholdStats\").TaskStats", value) &&
                    evaluate(typeof key === "string", `${argumentName}["durations"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key))), `${argumentName}["durations"]`, "import(\"./src/types/index\").JsonRecord<number, import(\"/home/schmop/cleanly/src/models/HouseholdStats\").TaskStats>", typedObj["durations"]) &&
        evaluate((typedObj["userParticipations"] !== null &&
            typeof typedObj["userParticipations"] === "object" ||
            typeof typedObj["userParticipations"] === "function") &&
            Object.entries<any>(typedObj["userParticipations"])
                .every(([key, value]) => (evaluate((value !== null &&
                    typeof value === "object" ||
                    typeof value === "function") &&
                    Object.entries<any>(value)
                        .every(([key, value]) => (evaluate(typeof value === "number", `${argumentName}["userParticipations"] value["${key.toString().replace(/"/g, '\\"')}"]`, "number", value) &&
                            evaluate(typeof key === "string", `${argumentName}["userParticipations"] value (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key))), `${argumentName}["userParticipations"]["${key.toString().replace(/"/g, '\\"')}"]`, "import(\"/home/schmop/cleanly/src/models/HouseholdStats\").UserParticipations", value) &&
                    evaluate(typeof key === "string", `${argumentName}["userParticipations"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key))), `${argumentName}["userParticipations"]`, "import(\"./src/types/index\").JsonRecord<number, import(\"/home/schmop/cleanly/src/models/HouseholdStats\").UserParticipations>", typedObj["userParticipations"])
    )
}

export function isTaskStats(obj: unknown, argumentName: string = "taskStats"): obj is TaskStats {
    const typedObj = obj as TaskStats
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate((typedObj["average"] === null ||
            typeof typedObj["average"] === "number"), `${argumentName}["average"]`, "number | null", typedObj["average"]) &&
        evaluate((typedObj["min"] === null ||
            typeof typedObj["min"] === "number"), `${argumentName}["min"]`, "number | null", typedObj["min"]) &&
        evaluate((typedObj["max"] === null ||
            typeof typedObj["max"] === "number"), `${argumentName}["max"]`, "number | null", typedObj["max"]) &&
        evaluate(typeof typedObj["num"] === "number", `${argumentName}["num"]`, "number", typedObj["num"])
    )
}
