<template>
  <ion-page>
    <ion-content id="household">
      <TaskView v-for="(task, index) in tasks" :task="task" :key="index" :show-actions="true"/>
    </ion-content>
    <ion-footer v-if="isAdmin">
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="primary" fill="solid" @click="openAddTaskModal">
            <ion-icon :icon="addCircleOutline" />
            {{ _t('Add task') }}
          </ion-button>
          <ion-button color="secondary" fill="solid" @click="openInviteModal">
            <ion-icon :icon="personAddOutline" />
            {{ _t('Send invite') }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline, personAddOutline } from "ionicons/icons";
import client from "../client";
import toast from "../toast";
import router from "../router";
import {
  IonPage,
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonCardHeader,
  IonModal,
  IonLoading,
  IonFooter,
  IonCardContent,
  IonMenuButton,
  IonMenu,
  IonCard,
  IonHeader,
  IonButtons,
  IonCardTitle,
  IonText,
  IonToolbar,
  IonTitle,
  IonList,
  IonButton,
  IonCardSubtitle,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import store from "../store";
import { Household } from "../models/Household";
import { User } from "../models/User";
import { Invite } from "../models/Invite";
import { mapState, mapMutations } from "vuex";
import TaskView from '../components/TaskView.vue';
import InviteModal from "@/modals/InviteModal.vue";
import AddTask from "../modals/AddTask.vue";
import { translations } from '../translation';
import { taskSortByPriority } from "@/common/task-priority";

export default defineComponent({
  name: "HouseholdView",
  components: {
    IonPage,
    IonContent,
    TaskView,
    IonToolbar,
    IonFooter,
    IonButtons,
    IonButton,
    IonIcon,
  },
  data: () => ({
    addCircleOutline,
    personAddOutline,
  }),
  props: {
    id: Number,
  },
  computed: {
    ...mapState(["households", "user"]),
    household(): null|Household {
      return this.households.find((household: Household) => household.id === this.id);
    },
    isAdmin(): boolean {
      return this.household?.admin === client.getMail();
    },
    tasks() {
      return this.household?.tasks.concat().sort(taskSortByPriority);
    },
  },
  methods: {
    ...translations,
    async openAddTaskModal(): Promise<void> {
      menuController.close("menu");
      const addTaskModal = await modalController.create({
        component: AddTask,
        componentProps: {
          id: this.household?.id,
        },
      });
      addTaskModal.present();
      await addTaskModal.onDidDismiss();
      await client.dashboardInfo();
    },
    async openInviteModal(): Promise<void> {
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
.button-badge {
  position: absolute;
  right: -6px;
  top: -9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>