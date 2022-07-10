<template>
  <ion-card color="light">
    <ion-card-header v-if="household">
      <ion-toolbar color="none">
        <ion-card-title>{{ household.name }}</ion-card-title>
        <ion-buttons slot="primary" v-if="isAdmin">
          <ion-button :id="editButtonId" @click.stop>
            <ion-icon slot="icon-only" :icon="ellipsisVertical"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-popover
          :trigger="editButtonId"
          v-if="isAdmin"
          dismiss-on-select
        >
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
      <TaskView
        v-for="(task, index) in tasks"
        :task="task"
        :key="index"
        :show-actions="false"
      />
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  personAddOutline,
  ellipsisVertical,
} from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
import {
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonButtons,
  IonFooter,
  IonCard,
  IonList,
  IonPopover,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  modalController,
} from "@ionic/vue";
import router from "@/router";
import { Household } from "@/models/Household";
import { Task } from "@/models/Task";
import TaskView from "@/components/TaskView.vue";
import InviteModal from "@/modals/InviteModal.vue";
import TaskForm from "@/modals/TaskForm.vue";
import { taskSortByPriority } from "@/common/task-priority";
import {translations} from "@/translation";
import { mapState } from "vuex";

export default defineComponent({
  name: "HouseholdPreview",
  components: {
    TaskView,
    IonButton,
    IonButtons,
    IonContent,
    IonLabel,
    IonIcon,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToolbar,
    IonList,
    IonPopover,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    personAddOutline,
    ellipsisVertical,
  }),
  props: {
    household: Object as () => Household,
  },
  computed: {
    ...mapState(['user']),
    isAdmin() {
      return this.household?.admin === this.user.id;
    },
    editButtonId() {
      return `household-button-${this.household?.id}`;
    },
    tasks() {
      return this.household?.tasks.concat().sort(taskSortByPriority).slice(0, 2);
    },
  },
  methods: {
    ...translations,
    async openTaskFormModal(): Promise<void> {
      const TaskFormModal = await modalController.create({
        component: TaskForm,
        componentProps: {
          id: this.household?.id,
        },
      });
      TaskFormModal.present();
      await TaskFormModal.onDidDismiss();
      await client.dashboardInfo();
    },
    async openInviteModal() {
      const createHouseholdModal = await modalController.create({
        component: InviteModal,
        componentProps: {
          household: this.household,
        },
      });
      createHouseholdModal.present();
    },
  },
});
</script>

<style scoped>
</style>