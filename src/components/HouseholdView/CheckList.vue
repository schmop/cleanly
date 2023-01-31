<template>
  <ion-page>
    <ion-content>
      <ion-reorder-group
        :disabled="false"
        @ionItemReorder="reorder"
      >
        <TransitionGroup name="checklist">
          <ion-item
            v-for="(todo, index) in todos"
            :key="todo.uuid"
          >
            <ion-button
              fill="clear"
              color="dark"
              shape="round"
              @click.stop="markAsCompleted(index)"
            >
              <SquareIcon slot="icon-only" />
            </ion-button>
            <ion-input
              :id="todo.uuid"
              v-model="todo.content"
              @ionInput="updateTodo(index, $event)"
            />
            <ion-reorder slot="end" />
          </ion-item>
        </TransitionGroup>

        <Transition name="nothing-yet">
          <ion-card v-if="todos.length === 0">
            <ion-card-header>
              <ion-card-title> {{ _t('There are no checklist entries yet') }}</ion-card-title>
            </ion-card-header>
          </ion-card>
        </Transition>
      </ion-reorder-group>
      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <ion-fab-button @click="addTodo">
          <PlusIcon />
        </ion-fab-button>
      </ion-fab>
      <ion-refresher
        slot="fixed"
        @ionRefresh="dashboardRefresher.forceReload($event)"
      >
        <ion-refresher-content />
      </ion-refresher>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import debounce from '@/common/debounce';
import { uuid4 } from '@/common/uuid';
import { dashboardRefresherSymbol, gettersSymbol, householdClientSymbol } from '@/dependency-injection/injection-keys';
import { Todo } from '@/models/Todo';
import { TodoEvent } from "@/models/TodoEvent";
import { showThrownError } from "@/toast";
import { _t } from '@/translation';
import {
    InputCustomEvent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonInput,
    IonItem,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    ItemReorderCustomEvent
} from "@ionic/vue";
import { computed, inject, Ref, ref, watch } from 'vue';
import { PlusIcon, SquareIcon } from 'vue-tabler-icons';

const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const dashboardRefresher = inject(dashboardRefresherSymbol)!;

const household = computed(() => getters.household.value);
const originTodos = computed(() => household.value?.checklist);

let todos: Ref<Todo[]> = ref([]);
let eventQueue: Ref<TodoEvent[]> = ref([]);
const requestFlushQueue = debounce(async () => {
    if (undefined === household.value || eventQueue.value.length === 0) {
        return;
    }
    const sentEventQueue = eventQueue.value;
    eventQueue.value = [];
    try {
        await householdClient.updateChecklist(household.value.id, sentEventQueue);
    } catch (err) {
        await showThrownError(err);
    }
}, 1000, false);


watch(
    originTodos,
    () => {
        if (undefined !== originTodos.value) {
            todos.value = originTodos.value;
        }
    },
    {
        immediate: true,
        deep: true,
    }
);

function addToQueue(event: TodoEvent) {
    eventQueue.value.push(event);
    requestFlushQueue();
}

function updateTodo(index: number, event: InputCustomEvent) {
    const todo = todos.value[index];
    if (undefined === todo) {
        throw new Error('Could not update nonexistent todo.');
    }
    // just the last content update is relevant, clear the rest
    eventQueue.value = eventQueue.value.filter(
        (event: TodoEvent) => event.uuid !== todo.uuid || event.type !== 'update'
    );
    addToQueue({
        type: 'update',
        uuid: todo.uuid,
        data: `${event.target.value ?? ''}`,
    });
}

function markAsCompleted(index: number) {
    const [todo] = todos.value.splice(index, 1);
    if (undefined === todo) {
        throw new Error('Could not remove nonexistent todo.');
    }
    const creationSynced = !eventQueue.value.some(
        (event) => event.uuid === todo.uuid && event.type === 'create'
    );
    // These events won't have an effect after deletion
    eventQueue.value = eventQueue.value.filter(
        (event: TodoEvent) => event.uuid !== todo.uuid
    );
    if (creationSynced) {
        addToQueue({
            type: 'delete',
            uuid: todo.uuid,
        });
    }
}

function reorder(event: ItemReorderCustomEvent) {
    const {from, to} = event.detail;
    const todo = todos.value[from];
    if (undefined === todo) {
        throw new Error('Could not move nonexistent todo.');
    }
    const insertBeforeUuid = todos.value[to < from ? to : to + 1]?.uuid ?? undefined;
    addToQueue({
        type: 'sort',
        uuid: todo.uuid,
        data: insertBeforeUuid,
    });
    // Source: Trust me, bro
    todos.value = event.detail.complete(todos.value) as Todo[];
}

function addTodo() {
    const todo: Todo = {uuid: uuid4(), content: ''};
    todos.value.push(todo);
    addToQueue({
        type: 'create',
        uuid: todo.uuid,
    });
    setTimeout(
        () => {
            const todoElement: (Element&{setFocus?: () => void})|null = document.querySelector(`[id="${todo.uuid}"]`);
            if (null !== todoElement && typeof todoElement.setFocus === 'function') {
                todoElement?.setFocus();
            }
        },
        100,
    );
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

.nothing-yet-enter-active {
    transition: opacity 0.5s ease;
}

.nothing-yet-enter-from,
.nothing-yet-leave-from,
.nothing-yet-leave-active {
    opacity: 0;
}
</style>
