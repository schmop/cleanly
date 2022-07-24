<template>
    <ion-page>
        <ion-content>
            <ion-reorder-group :disabled="false" @ionItemReorder="reorder">
                <TransitionGroup name="checklist">
                    <ion-item v-for="(todo, index) in todos" :key="todo.uuid">
                        <ion-button fill="clear" color="dark" shape="round" @click.stop="markAsCompleted(index)">
                            <ion-icon slot="icon-only" :icon="ellipseOutline" />
                        </ion-button>
                        <ion-input @ionInput="updateTodo(index, $event)" v-model="todo.content"></ion-input>
                        <ion-reorder slot="end">
                        </ion-reorder>
                    </ion-item>
                </TransitionGroup>

            </ion-reorder-group>
            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button @click="addTodo">
                    <ion-icon :icon="add" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>

    </ion-page>
</template>

<script setup lang="ts">
import { inject, reactive, computed, watch } from 'vue';
import {
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonInput,
    IonItem,
    IonPage,
    IonReorder,
    IonReorderGroup,
    ItemReorderCustomEvent,
} from "@ionic/vue";
import { Todo } from '../../models/Todo';
import { add, ellipseOutline } from "ionicons/icons";
import { uuid4 } from '../../common/uuid';
import { IonContent } from '@ionic/vue';
import debounce from '../../common/debounce';
import toast from "@/toast";
import { TodoEvent } from "@/models/TodoEvent";
import { gettersSymbol } from '@/dependency-injection/injection-keys';
import { householdClientSymbol } from '../../dependency-injection/injection-keys';

const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const originTodos = computed(() => household.value?.checklist);

let todos: Todo[] = reactive([]);
let eventQueue: TodoEvent[] = reactive([]);
const requestFlushQueue = debounce(async () => {
    if (null == household.value) {
        return;
    }
    const sentEventQueue = eventQueue;
    eventQueue = [];
    if (!await householdClient.updateChecklist(household.value.id, sentEventQueue)) {
        toast.error('Could not send updated checklist to server!');
    }
}, 1000, false);


watch(
    originTodos,
    () => {
        if (null != originTodos.value) {
            todos = originTodos.value;
        }
    },
    {
        immediate: true,
        deep: true,
    }
);

function addToQueue(event: TodoEvent) {
    eventQueue.push(event);
    requestFlushQueue();
}
function updateTodo(index: number, event: any) {
    const todo = todos[index];
    // just the last content update is relevant, clear the rest
    eventQueue = eventQueue.filter(
        (event: TodoEvent) => event.uuid !== todo.uuid || event.type !== 'update'
    );
    addToQueue({
        type: 'update',
        uuid: todo.uuid,
        data: event.target.value,
    });
}
function markAsCompleted(index: number) {
    const [todo] = todos.splice(index, 1);
    // These events won't have an effect after deletion
    eventQueue = eventQueue.filter(
        (event: TodoEvent) => event.uuid !== todo.uuid
    );
    addToQueue({
        type: 'delete',
        uuid: todo.uuid,
    });
}
function reorder(event: ItemReorderCustomEvent) {
    const { from, to } = event.detail;
    const todo = todos[from];
    const insertBeforeUuid = todos[to < from ? to : to + 1]?.uuid ?? undefined;
    addToQueue({
        type: 'sort',
        uuid: todo.uuid,
        data: insertBeforeUuid,
    });
    todos = event.detail.complete(todos);
}
function addTodo() {
    const todo: Todo = { uuid: uuid4(), content: '' };
    todos.push(todo);
    addToQueue({
        type: 'create',
        uuid: todo.uuid,
    });
}
</script>

<style scoped>
.checklist-move,
/* apply transition to moving elements */
.checklist-enter-active,
.checklist-leave-active {
    transition: all 0.5s ease;
}

.checklist-enter-from,
.checklist-leave-to {
    opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.checklist-leave-active {
    position: absolute;
    width: 100%;
}
</style>