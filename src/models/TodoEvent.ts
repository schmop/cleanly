/** @see {isTodoEvent} ts-auto-guard:type-guard */
export interface TodoEvent {
    uuid: string,
    checklistUuid: string,
    type: TodoEventType,
    data: string|null,
}

export interface ChecklistEventQueue {
    checklistUuid: string|null,
    events: TodoEvent[],
}

export type TodoEventType = 'sort'|'delete'|'update'|'create';
