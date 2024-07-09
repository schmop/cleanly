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
            :id="todo.uuid"
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
            <ion-textarea
              :id="todo.uuid"
              v-model="todo.content"
              :aria-label="_t('Checklist entry')"
              :auto-grow="true"
              :rows="1"
              @ionInput="updateTodo(index, $event)"
              @keydown.enter.prevent="addTodo"
            />
            <ion-reorder
              slot="end"
            />
          </ion-item>
        </TransitionGroup>

        <Transition name="nothing-yet">
          <ion-card
            v-if="todos.length === 0"
            key="nothing-yet"
          >
            <ion-card-header>
              <ion-card-title> {{ _t('There are no checklist entries yet') }}</ion-card-title>
            </ion-card-header>
          </ion-card>
        </Transition>
      </ion-reorder-group>
      <ion-button
        vertical="bottom"
        expand="full"
        horizontal="end"
        @click="addTodo"
      >
        <PlusIcon />
        {{ _t('Add entry') }}
      </ion-button>
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
import {
  dashboardRefresherSymbol,
  gettersSymbol,
  householdClientSymbol,
  stateSymbol
} from '@/dependency-injection/injection-keys';
import { Todo } from '@/models/Todo';
import { ChecklistEventQueue, TodoEvent } from "@/models/TodoEvent";
import { showThrownError } from "@/toast";
import { _t } from '@/translation';
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonTextarea,
  ItemReorderCustomEvent
} from "@ionic/vue";
import { computed, inject, reactive, Ref, ref, watch } from 'vue';
import { PlusIcon, SquareIcon } from 'vue-tabler-icons';
import { IonTextareaCustomEvent } from "@ionic/core";

const getters = inject(gettersSymbol)!;
const state = inject(stateSymbol)!;

const householdClient = inject(householdClientSymbol)!;
const dashboardRefresher = inject(dashboardRefresherSymbol)!;

const household = computed(() => getters.household.value);
const originTodos = computed(
  () => household.value?.checklists.find(checklist => checklist.uuid === state.openChecklist)?.checklist ?? []
);

const todos: Ref<Todo[]> = ref([]);
const eventQueue: ChecklistEventQueue = reactive<ChecklistEventQueue>({
  checklistUuid: state.openChecklist,
  events: [],
});
const requestFlushQueue = debounce(async () => {
  if (undefined === household.value || eventQueue.events.length === 0 || null == eventQueue.checklistUuid) {
    return;
  }
  const sentEventQueue = eventQueue.events;
  eventQueue.events = [];
  try {
    await householdClient.updateChecklist(eventQueue.checklistUuid, sentEventQueue);
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
  if (event.checklistUuid !== eventQueue.checklistUuid) {
    console.warn('Event for different checklist, clearing queue.');
    eventQueue.checklistUuid = event.checklistUuid;
    eventQueue.events = [event];
    return;
  }
  eventQueue.events.push(event);
  requestFlushQueue();
}

function updateTodo(index: number, event: IonTextareaCustomEvent<unknown>) {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const todo = todos.value[index];
  if (undefined === todo) {
    throw new Error('Could not update nonexistent todo.');
  }
  // just the last content update is relevant, clear the rest
  eventQueue.events = eventQueue.events.filter(
    (event: TodoEvent) => event.uuid !== todo.uuid || event.type !== 'update'
  );
  addToQueue({
    type: 'update',
    checklistUuid: state.openChecklist,
    uuid: todo.uuid,
    data: `${event.target.value ?? ''}`,
  });
}

function markAsCompleted(index: number) {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const [todo] = todos.value.splice(index, 1);
  if (undefined === todo) {
    throw new Error('Could not remove nonexistent todo.');
  }
  const creationSynced = !eventQueue.events.some(
    (event) => event.uuid === todo.uuid && event.type === 'create'
  );
  // These events won't have an effect after deletion
  eventQueue.events = eventQueue.events.filter(
    (event: TodoEvent) => event.uuid !== todo.uuid
  );
  if (creationSynced) {
    addToQueue({
      type: 'delete',
      checklistUuid: state.openChecklist,
      uuid: todo.uuid,
      data: null,
    });
  }
}

function reorder(event: ItemReorderCustomEvent) {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const {from, to} = event.detail;
  const todo = todos.value[from];
  if (undefined === todo) {
    throw new Error('Could not move nonexistent todo.');
  }
  const insertBeforeUuid = todos.value[to < from ? to : to + 1]?.uuid ?? null;
  addToQueue({
    type: 'sort',
    checklistUuid: state.openChecklist,
    uuid: todo.uuid,
    data: insertBeforeUuid,
  });
  // Source: Trust me, bro
  todos.value = event.detail.complete(todos.value) as Todo[];
}

function addTodo() {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const todo: Todo = {uuid: uuid4(), content: ''};
  todos.value.push(todo);
  addToQueue({
    checklistUuid: state.openChecklist,
    type: 'create',
    uuid: todo.uuid,
    data: null,
  });
  setTimeout(() => {
    const todoElement: (Element & {setFocus?: () => void}) | null = document.querySelector(`ion-textarea[id="${todo.uuid}"]`);
    if (null !== todoElement && typeof todoElement.setFocus === 'function') {
      todoElement?.setFocus();
    }
  }, 100);
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
