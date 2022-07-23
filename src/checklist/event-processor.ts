import { Todo } from '@/models/Todo';
import { TodoEvent } from '../models/TodoEvent';
import toast from '@/toast';
import { State } from '../store/index';
import { Store } from 'vuex';
import { HouseholdClient } from '../client/household-client';

export class EventProcessor {
    constructor(private store: Store<State>, private householdClient: HouseholdClient) {
    }

    processBatch(events: TodoEvent[], householdId: number): void {
        const todos = this.store.getters.checklist(householdId);
        if (null == todos) {
            this.error('processing multiple checklist updates');
            return;
        }
        events.forEach((event: TodoEvent) => {
            this.process(event, todos);
        });
        // TODO: Check if new commit to store is needed
        // this.store.commit('updateChecklist', {household_id: householdId, checklist: todos});
    }

    process(event: TodoEvent, todos: Todo[]): void {
        switch (event.type) {
            case 'create':
                this.create(event, todos);
                break;
            case 'update':
                this.update(event, todos);
                break;
            case 'sort':
                this.sort(event, todos);
                break;
            case 'delete':
                this.delete(event, todos);
                break;
        }
    }

    private create(event: TodoEvent, todos: Todo[]) {
        const alreadyExists = null != todos.find((todo: Todo) => todo.uuid === event.uuid);
        if (alreadyExists || (typeof event.data !== 'string' && event.data != null)) {
            this.error('creating checklist entries');
            return;
        }
        todos.push({
            uuid: event.uuid,
            content: event.data ?? '',
        } as Todo);
    }

    private update(event: TodoEvent, todos: Todo[]) {
        const todo = todos.find((todo: Todo) => todo.uuid === event.uuid);
        if (!todo || typeof event.data !== 'string') {
            this.error('updating existing checklist entries');
            return;
        }
        todo.content = event.data;
    }

    private sort(event: TodoEvent, todos: Todo[]): void {
        const index = todos.findIndex((todo: Todo) => todo.uuid === event.uuid);
        let insertBeforeIndex = event.data === null
            ? todos.length
            : todos.findIndex((todo: Todo) => todo.uuid === event.data);
        if (null === index || null === insertBeforeIndex) {
            this.error('sorting checklist entries');
            return;
        }
        const [todo] = todos.splice(index, 1);
        if (insertBeforeIndex > index) {
            insertBeforeIndex--;
        }
        todos.splice(insertBeforeIndex, 0, todo);
    }

    private delete(event: TodoEvent, todos: Todo[]) {
        const index = todos.findIndex((todo: Todo) => todo.uuid === event.uuid);
        if (null === index) {
            this.error('deleting checklist entries');
            return;
        }
        todos.splice(index, 1);
    }

    private error(action: string): void {
        console.warn(`Synchronization error while ${action}, reloading...`);
        toast.warning(`Synchronization error while ${action}, reloading...`);
        this.householdClient.dashboardInfo();
    }
}