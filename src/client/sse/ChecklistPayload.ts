import { TodoEvent } from "@/models/TodoEvent";
import { ChecklistUuid } from "@/types";

/** @see {isChecklistPayload} ts-auto-guard:type-guard */
export interface ChecklistPayload {
    events: TodoEvent[],
    checklist_uuid: ChecklistUuid,
}
