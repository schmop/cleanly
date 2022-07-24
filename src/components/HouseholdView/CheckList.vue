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

<script lang="ts">
import { defineComponent } from "vue";
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
import { Household } from "@/models/Household";
import { Todo } from '../../models/Todo';
import { add, ellipseOutline } from "ionicons/icons";
import { uuid4 } from '../../common/uuid';
import { IonContent } from '@ionic/vue';
import debounce from '../../common/debounce';
import toast from "@/toast";
import { TodoEvent } from "@/models/TodoEvent";
import { container } from "@/container";
import { store } from "@/store";

export default defineComponent({
    name: "CheckList",
    components: {
        IonPage,
        IonReorderGroup,
        IonReorder,
        IonItem,
        IonFab,
        IonButton,
        IonFabButton,
        IonContent,
        IonIcon,
        IonInput,
    },
    data: () => ({
        add,
        ellipseOutline,
        todos: [] as Todo[],
        eventQueue: [] as TodoEvent[],
        requestFlushQueue: (() => {/*NOOP*/ }) as (() => void),
    }),
    computed: {
        household(): undefined | Household {
            return store.state.households.find((household: Household) => household.id === this.id);
        },
        originTodos() {
            return this.household?.checklist;
        },
        id() {
            return store.state.viewedHousehold;
        }
    },
    watch: {
        originTodos: {
            deep: true,
            immediate: true,
            handler() {
                if (this.originTodos) {
                    this.todos = this.originTodos;
                }
            }
        },
    },
    created() {
        this.requestFlushQueue = debounce(async () => {
            if (!this.id) {
                return;
            }
            const sentEventQueue = this.eventQueue;
            this.eventQueue = [];
            if (!await container.getHouseholdClient().updateChecklist(this.id, sentEventQueue)) {
                toast.error('Could not send updated checklist to server!');
            }
        }, 1000, false);
    },
    methods: {
        addToQueue(event: TodoEvent) {
            this.eventQueue.push(event);
            this.requestFlushQueue();
        },
        updateTodo(index: number, event: any) {
            const todo = this.todos[index];
            // just the last content update is relevant, clear the rest
            this.eventQueue = this.eventQueue.filter(
                (event: TodoEvent) => event.uuid !== todo.uuid || event.type !== 'update'
            );
            this.addToQueue({
                type: 'update',
                uuid: todo.uuid,
                data: event.target.value,
            });
        },
        markAsCompleted(index: number) {
            const [todo] = this.todos.splice(index, 1);
            // These events won't have an effect after deletion
            this.eventQueue = this.eventQueue.filter(
                (event: TodoEvent) => event.uuid !== todo.uuid
            );
            this.addToQueue({
                type: 'delete',
                uuid: todo.uuid,
            });
        },
        reorder(event: ItemReorderCustomEvent) {
            const {from, to} = event.detail;
            const todo = this.todos[from];
            const insertBeforeUuid = this.todos[to < from ? to : to + 1]?.uuid ?? undefined;
            this.addToQueue({
                type: 'sort',
                uuid: todo.uuid,
                data: insertBeforeUuid,
            });
            this.todos = event.detail.complete(this.todos);
        },
        addTodo() {
            const todo: Todo = { uuid: uuid4(), content: '' };
            this.todos.push(todo);
            this.addToQueue({
                type: 'create',
                uuid: todo.uuid,
            });
        },
    }
});
</script>

<style scoped>
.checklist-move, /* apply transition to moving elements */
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