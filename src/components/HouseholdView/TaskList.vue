<template>
    <ion-page>
        <ion-content v-if="household">
            <TaskView v-for="(task, index) in sortedTasks" :task="task" :household="household" :key="index"
                :show-actions="true" />

            <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="canManageTasks">
                <ion-fab-button @click="openTaskFormModal">
                    <ion-icon :icon="add" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { taskSortByPriority } from "@/common/task-priority";
import { gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import TaskForm from '@/modals/TaskForm.vue';
import {
    IonContent, IonFab,
    IonFabButton,
    IonIcon, IonPage, menuController,
    modalController
} from "@ionic/vue";
import { add } from 'ionicons/icons';
import { computed, inject } from 'vue';
import TaskView from '../TaskView.vue';

const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const sortedTasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const canManageTasks = computed(() => getters.canManageTasks.value());

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