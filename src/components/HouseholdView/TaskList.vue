<template>
    <ion-page>
        <ion-content>
            <TaskView v-for="(task, index) in sortedTasks" :task="task" :key="index" :show-actions="true" />

            <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="isAdmin">
                <ion-fab-button @click="openTaskFormModal">
                    <ion-icon :icon="add" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import {
    IonContent,
    IonPage,
    IonFab,
    IonFabButton,
    IonIcon,
    menuController,
    modalController,
} from "@ionic/vue";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";
import { gettersSymbol, householdClientSymbol, stateSymbol } from "@/dependency-injection/injection-keys";
import TaskForm from '@/modals/TaskForm.vue';
import { add } from 'ionicons/icons';

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const sortedTasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const user = computed(() => state.user);
const admin = computed(() => household.value?.admin);
const isAdmin = computed(() => user.value != null && admin.value != null && user.value.id === admin.value);


async function openTaskFormModal(): Promise<void> {
    menuController.close("menu");
    const TaskFormModal = await modalController.create({
        component: TaskForm,
        componentProps: {
            id: household.value?.id,
        },
    });
    TaskFormModal.present();
    await TaskFormModal.onDidDismiss();
    await householdClient.dashboardInfo();
}
</script>

<style scoped>
</style>