<template>
  <ion-card>
    <ion-card-header>
      <ion-toolbar>
        <ion-card-title>{{ household.name }}</ion-card-title>
        <ion-buttons slot="primary" v-if="isAdmin">
          <ion-button :id="editButtonId">
            <ion-icon slot="icon-only" :icon="ellipsisVertical"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-popover :trigger="editButtonId" v-if="isAdmin" ref="popover" dismiss-on-select>
          <ion-content>
            <ion-list>
              <ion-item button>
                <ion-icon slot="start" :icon="addCircleOutline" />
                <ion-label> New Task </ion-label>
              </ion-item>
              <ion-item button @click="openInviteModal">
                <ion-icon slot="start" :icon="personAddOutline" />
                <ion-label> Send invite </ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-toolbar>
    </ion-card-header>
    <ion-card-content>
      <TaskView
        v-for="(task, index) in household.tasks"
        :task="task"
        :key="index"
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
import TaskView from "@/components/TaskView.vue";
import InviteModal from "@/modals/InviteModal.vue";

export default defineComponent({
  name: "HouseholdView",
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
    isAdmin() {
      return this.household?.admin === client.getMail();
    },
    editButtonId() {
      return `household-button-${this.household?.id}`;
    },
  },
  mounted() {
    console.log(this.household);
  },
  methods: {
    async openInviteModal() {
      const createHouseholdModal = await modalController.create({
        component: InviteModal,
        componentProps: {
          household: this.household
        }
      });
      createHouseholdModal.present();
    },
  },
});
</script>

<style scoped>
</style>