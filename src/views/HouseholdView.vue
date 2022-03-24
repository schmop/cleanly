<template>
  <ion-page>
    <ion-content id="household">
      <TaskView
        v-for="(task, index) in household.tasks"
        :task="task"
        :key="index"
      />
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="primary" fill="solid" @click="openAddTaskModal(id)">
            Add task
            <ion-icon :icon="addCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { closeOutline, enterOutline, addCircleOutline } from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
import router from "@/router";
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
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import { mapState, mapMutations } from "vuex";
import TaskView from '@/components/TaskView.vue';
import {openAddTaskModal} from '@/modals/AddTask.vue';

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
    addCircleOutline
  }),
  props: {
    id: Number,
  },
  computed: {
    ...mapState(["households", "user"]),
    household() {
      return this.households.find((household: Household) => household.id === this.id);
    }
  },
  methods: {
    openAddTaskModal,
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