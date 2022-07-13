<template>
    <ion-page>
        <ion-content>
            <ion-reorder-group :disabled="false" @ionItemReorder="reorder">
                <ion-item v-for="(todo) in todos" :key="todo.uuid">
                    <ion-button fill="clear" color="dark" shape="round" @click.stop="markAsCompleted(todo)">
                        <ion-icon slot="icon-only" :icon="ellipseOutline" />
                    </ion-button>
                    <ion-input v-model="todo.content"></ion-input>
                    <ion-reorder slot="end">
                    </ion-reorder>
                </ion-item>
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
    modalController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import { Todo } from '../../models/Todo';
import { add, ellipseOutline } from "ionicons/icons";
import { uuid4 } from '../../common/uuid';
import { IonContent } from '@ionic/vue';
import debounce from '../../common/debounce';
import { householdClient } from "@/client/household-client";
import toast from "@/toast";

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
        requestUpdate: (() => {/*NOOP*/ }) as (() => void),
    }),
    props: {
        id: Number,
    },
    computed: {
        ...mapState(["households"]),
        household(): null | Household {
            return this.households.find((household: Household) => household.id === this.id);
        },
        originTodos() {
            return this.household?.checklist;
        },
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
        todos: {
            deep: true,
            handler() {
                this.requestUpdate();
            }
        },
    },
    created() {
        this.requestUpdate = debounce(async () => {
            if (!this.id) {
                return;
            }
            if (!await householdClient.updateChecklist(this.id, this.todos)) {
                toast.error('Could not send updated checklist to server!');
            }
        }, 1000, false);
    },
    methods: {
        markAsCompleted(todo: Todo) {
            this.todos = this.todos.filter((someTodo) => someTodo.uuid !== todo.uuid);
        },
        reorder(event: ItemReorderCustomEvent) {
            this.todos = event.detail.complete(this.todos);
        },
        addTodo() {
            this.todos.push({ uuid: uuid4(), content: '' } as Todo);
        },
    }
});
</script>

<style scoped>
</style>