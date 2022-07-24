<template>
  <ion-card color="light">
    <ion-card-header v-if="household">
      <ion-toolbar color="none">
        <ion-card-title>{{ household.name }}</ion-card-title>
        <ion-buttons slot="primary" v-if="isAdmin">
          <ion-button :id="editButtonId" @click.stop="() => {/** noop */ }">
            <ion-icon slot="icon-only" :icon="ellipsisVertical"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-popover :trigger="editButtonId" v-if="isAdmin" dismiss-on-select>
          <ion-content>
            <ion-list>
              <ion-item button @click="openTaskFormModal">
                <ion-icon slot="start" :icon="addCircleOutline" />
                <ion-label> {{ _t('New task') }} </ion-label>
              </ion-item>
              <ion-item button @click="openInviteModal">
                <ion-icon slot="start" :icon="personAddOutline" />
                <ion-label> {{ _t('Send invite') }} </ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-toolbar>
    </ion-card-header>
    <ion-card-content>
      <TaskView v-for="(task, index) in tasks" :task="task" :key="index" :show-actions="false" />
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import {
  addCircleOutline,
  personAddOutline,
  ellipsisVertical,
} from "ionicons/icons";
import {
  IonLabel,
  IonItem,
  IonContent,
  IonToolbar,
  IonIcon,
  IonButton,
  IonButtons,
  IonCard,
  IonList,
  IonPopover,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  modalController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import TaskView from "@/components/TaskView.vue";
import InviteModal from "@/modals/InviteModal.vue";
import TaskForm from "@/modals/TaskForm.vue";
import { taskSortByPriority } from "@/common/task-priority";
import { stateSymbol, householdClientSymbol } from '../dependency-injection/injection-keys';
import { _t } from '@/translation';

const props = defineProps<{
  household: Household
}>();
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const isAdmin = computed(() => props.household.admin === state.user?.id);
const editButtonId = computed(() => `household-button-${props.household.id}`);
const tasks = computed(() => props.household.tasks.concat().sort(taskSortByPriority).slice(0, 2));

async function openTaskFormModal(): Promise<void> {
  const TaskFormModal = await modalController.create({
    component: TaskForm,
    componentProps: {
      id: props.household.id,
    },
  });
  TaskFormModal.present();
  await TaskFormModal.onDidDismiss();
  await householdClient.dashboardInfo();
}
async function openInviteModal() {
  const createHouseholdModal = await modalController.create({
    component: InviteModal,
    componentProps: {
      household: props.household,
    },
  });
  createHouseholdModal.present();
}
</script>

<style scoped>
</style>