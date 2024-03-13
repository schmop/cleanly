/*
 * Generated type guards for "HouseholdStats.ts".
 * WARNING: Do not manually change this file.
 */
import { HouseholdStats, TaskStats } from "./HouseholdStats";

export function isHouseholdStats(obj: unknown): obj is HouseholdStats {
    const typedObj = obj as HouseholdStats
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["durations"] !== null &&
            typeof typedObj["durations"] === "object" ||
            typeof typedObj["durations"] === "function") &&
        Object.entries<any>(typedObj["durations"])
            .every(([key, value]) => (isTaskStats(value) as boolean &&
                typeof key === "string")) &&
        (typedObj["userParticipations"] !== null &&
            typeof typedObj["userParticipations"] === "object" ||
            typeof typedObj["userParticipations"] === "function") &&
        Object.entries<any>(typedObj["userParticipations"])
            .every(([key, value]) => ((value !== null &&
                typeof value === "object" ||
                typeof value === "function") &&
                Object.entries<any>(value)
                    .every(([key, value]) => (typeof value === "number" &&
                        typeof key === "string")) &&
                typeof key === "string"))
    )
}

export function isTaskStats(obj: unknown): obj is TaskStats {
    const typedObj = obj as TaskStats
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["average"] === null ||
            typeof typedObj["average"] === "number") &&
        (typedObj["min"] === null ||
            typeof typedObj["min"] === "number") &&
        (typedObj["max"] === null ||
            typeof typedObj["max"] === "number") &&
        typeof typedObj["num"] === "number"
    )
}
