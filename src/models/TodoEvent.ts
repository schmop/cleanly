/** @see {isTodoEvent} ts-auto-guard:type-guard */
export interface TodoEvent {
    uuid: string,
    type: TodoEventType,
    data: string|null,
}

export type TodoEventType = 'sort' | 'delete' | 'update' | 'create';
