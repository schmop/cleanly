export interface TodoEvent {
    uuid: string,
    type: TodoEventType,
    data?: string,
}

export type TodoEventType = 'sort' | 'delete' | 'update' | 'create';