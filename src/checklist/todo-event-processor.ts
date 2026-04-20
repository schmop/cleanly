import { isChecklistPayload } from "@/client/sse/ChecklistPayload.guard";
import { Checklist } from "@/models/Household";
import { Todo } from '@/models/Todo';
import { TodoEvent } from '@/models/TodoEvent';
import { Store } from '@/store';
import toast, { warning } from '@/toast';

export class TodoEventProcessor {
    constructor(private store: Store) {
    }

    processBatch(payload: unknown): void {
        if (!isChecklistPayload(payload)) {
            void warning('Live updates received wrong checklist data!');
            return;
        }
        let checklist: Checklist|null = null;
        outer: for (const household of this.store.state.households) {
            for (const c of household.checklists) {
                if (c.uuid === payload.checklist_uuid) {
                    checklist = c;
                    break outer;
                }
            }
        }
        if (null == checklist) {
            this.error('processing multiple checklist updates');
            return;
        }
        payload.events.forEach((event: TodoEvent) => {
            if (payload.checklist_uuid !== event.checklistUuid) {
                this.error('processing multiple checklist updates');
                return;
            }
            this.process(event, checklist);
        });
    }

    process(event: TodoEvent, checklist: Checklist): void {
        switch (event.type) {
            case 'create':
                this.create(event, checklist);
                break;
            case 'update':
                this.update(event, checklist);
                break;
            case 'sort':
                this.sort(event, checklist);
                break;
            case 'check':
                this.check(event, checklist);
                break;
            case 'delete':
                this.delete(event, checklist);
                break;
        }
    }

    private create(event: TodoEvent, checklist: Checklist) {
        const alreadyExists = null != checklist.checklist.find((todo: Todo) => todo.uuid === event.uuid);
        if (alreadyExists || (typeof event.data !== 'string' && event.data != null)) {
            this.error('creating checklist entries');
            return;
        }
        checklist.checklist.push({
            uuid: event.uuid,
            content: event.data ?? '',
            checked_at: null,
        });
    }

    private update(event: TodoEvent, checklist: Checklist) {
        const todo = checklist.checklist.find((todo: Todo) => todo.uuid === event.uuid);
        if (!todo || typeof event.data !== 'string') {
            this.error('updating existing checklist entries');
            return;
        }
        todo.content = event.data;
    }

    private sort(event: TodoEvent, checklist: Checklist): void {
        const index = checklist.checklist.findIndex((todo: Todo) => todo.uuid === event.uuid);
        let insertBeforeIndex = event.data === null
            ? checklist.checklist.length
            : checklist.checklist.findIndex((todo: Todo) => todo.uuid === event.data);
        if (null === index || null === insertBeforeIndex) {
            this.error('sorting checklist entries');
            return;
        }
        const [todo] = checklist.checklist.splice(index, 1);
        if (undefined === todo) {
            this.error('sorting checklist entries');
            return;
        }
        if (insertBeforeIndex > index) {
            insertBeforeIndex--;
        }
        checklist.checklist.splice(insertBeforeIndex, 0, todo);
    }

    private check(event: TodoEvent, checklist: Checklist) {
        const todo = checklist.checklist.find((todo: Todo) => todo.uuid === event.uuid);
        if (null == todo) {
            this.error('checking checklist entries');
            return;
        }
        todo.checked_at = event.data ? Number(event.data) : null;
    }

    private delete(event: TodoEvent, checklist: Checklist) {
        const index = checklist.checklist.findIndex((todo: Todo) => todo.uuid === event.uuid);
        if (null === index) {
            this.error('deleting checklist entries');
            return;
        }
        checklist.checklist.splice(index, 1);
    }

    private error(action: string): void {
        console.warn(`Synchronization error while ${action}, reloading...`);
        void toast.warning(`Synchronization error while ${action}, reloading...`);
    }
}
