<template>
  <ion-page>
    <ion-content>
      <ion-reorder-group
        :disabled="false"
        @ionItemReorder="reorder"
      >
        <ion-item
          v-for="(todo, index) in todos"
          :id="todo.uuid"
          :key="todo.uuid"
        >
          <ion-button
            fill="clear"
            color="dark"
            shape="round"
            @click.stop="markAsCompleted(todo.uuid)"
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
            @keydown.enter.prevent="addTodo(todo.uuid)"
          />
          <ion-reorder
            slot="end"
          />
        </ion-item>

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
      <ion-list>
        <ion-item
          v-for="(todo, index) in checkedTodos"
          :id="todo.uuid"
          :key="todo.uuid"
        >
          <ion-button
            fill="clear"
            color="dark"
            shape="round"
            @click.stop="markAsCompleted(todo.uuid)"
          >
            <SquareXIcon slot="icon-only" />
          </ion-button>
          <ion-textarea
            :id="todo.uuid"
            v-model="todo.content"
            :disabled="true"
            :aria-label="_t('Checklist entry')"
            :auto-grow="true"
            :rows="1"
            @ionInput="updateTodo(index, $event)"
            @keydown.enter.prevent="addTodo(todo.uuid)"
          />
        </ion-item>
      </ion-list>
      <ion-toolbar class="position-sticky">
        <ion-button
          slot="start"
          vertical="bottom"
          horizontal="end"
          color="danger"
          @click="removeChecked()"
        >
          <TrashIcon />
          {{ _t('Clear checked') }}
        </ion-button>
        <ion-button
          slot="end"
          vertical="bottom"
          horizontal="end"
          class="position-sticky"
          @click="addTodo(null)"
        >
          <PlusIcon />
          {{ _t('Add entry') }}
        </ion-button>
      </ion-toolbar>
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
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonTextarea,
  IonToolbar,
  ItemReorderCustomEvent
} from "@ionic/vue";
import { computed, inject, reactive, Ref, ref, watch } from 'vue';
import { PlusIcon, SquareIcon, SquareXIcon, TrashIcon } from 'vue-tabler-icons';
import { IonTextareaCustomEvent } from "@ionic/core";
import { ChecklistUuid } from "@/types";

const getters = inject(gettersSymbol)!;
const state = inject(stateSymbol)!;

const householdClient = inject(householdClientSymbol)!;
const dashboardRefresher = inject(dashboardRefresherSymbol)!;

const household = computed(() => getters.household.value);
const openChecklist = computed(() => household.value?.checklists.find(checklist => checklist.uuid === state.openChecklist));
const originTodos = computed(
  () => openChecklist.value?.checklist ?? []
);

const todos: Ref<Todo[]> = ref([]);
const checkedTodos: Ref<Todo[]> = ref([]);
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
      todos.value = originTodos.value.filter(todo => todo.checked_at === null);
      checkedTodos.value = originTodos.value.filter(todo => todo.checked_at !== null);
      checkedTodos.value.sort((a, b) => {
        if (a.checked_at === null || b.checked_at === null) {
          return 0;
        }
        return b.checked_at - a.checked_at;
      });
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

function markAsCompleted(uuid: string) {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const todo = todos.value.find((t) => t.uuid === uuid) ?? checkedTodos.value.find((t) => t.uuid === uuid);
  if (undefined === todo) {
    throw new Error('Could not remove nonexistent todo.');
  }
  todo.checked_at = null === todo.checked_at ? Date.now() : null;
  addToQueue({
    type: 'check',
    checklistUuid: state.openChecklist,
    uuid: todo.uuid,
    data: null === todo.checked_at ? null : `${todo.checked_at}`,
  });
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

function moveTodoAfterFocus(moveThis: ChecklistUuid, afterThis: ChecklistUuid): void {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const todosWithoutSelf = todos.value.filter(todo => todo.uuid !== moveThis);
  const currentIndex = todosWithoutSelf.findIndex(todo => todo.uuid === afterThis);
  const nextTodo = todosWithoutSelf[currentIndex + 1];
  if (currentIndex !== -1 && nextTodo !== undefined) {
    addToQueue({
      checklistUuid: state.openChecklist,
      type: 'sort',
      uuid: moveThis,
      data: nextTodo.uuid,
    });
    const moveIndex = todos.value.findIndex(todo => todo.uuid === moveThis);
    const [moveTodo] = todos.value.splice(moveIndex, 1);
    if (!moveTodo) {
      return;
    }
    todos.value.splice(currentIndex + 1, 0, moveTodo);
  }
}

function removeChecked() {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  for (const checkedTodo of checkedTodos.value) {
    const index = openChecklist.value?.checklist.indexOf(checkedTodo);
    if (index !== undefined && index !== -1) {
      openChecklist.value?.checklist.splice(index, 1);
    }
    addToQueue({
      checklistUuid: state.openChecklist,
      type: 'delete',
      uuid: checkedTodo.uuid,
      data: null,
    });
  }
  checkedTodos.value = [];
}

function addTodo(insertAfterUuid: ChecklistUuid | null = null) {
  if (null == state.openChecklist) {
    throw new Error('No checklist open to update.');
  }
  const todo: Todo = {uuid: uuid4(), content: '', checked_at: null};
  todos.value.push(todo);
  openChecklist.value?.checklist.push(todo);
  addToQueue({
    checklistUuid: state.openChecklist,
    type: 'create',
    uuid: todo.uuid,
    data: null,
  });
  if (insertAfterUuid !== null) {
    moveTodoAfterFocus(todo.uuid, insertAfterUuid);
  }
  setTimeout(() => {
    const todoElement: (Element & {
      setFocus?: () => void
    }) | null = document.querySelector(`ion-textarea[id="${todo.uuid}"]`);
    if (null !== todoElement && typeof todoElement.setFocus === 'function') {
      todoElement?.setFocus();
    }
  }, 100);
}
</script>

<style scoped>
.position-sticky {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/** Remove last line of todos */
ion-item:last-child {
  --inner-border-width: 0 0 0 0 !important;
}
</style>
