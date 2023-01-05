import { TodoEvent } from "@/models/TodoEvent";
import { HouseholdId } from "@/types";

/** @see {isChecklistPayload} ts-auto-guard:type-guard */
export interface ChecklistPayload {
    events: TodoEvent[],
    household_id: HouseholdId,
}
