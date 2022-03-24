<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="icons[task.icon]" />
        {{ task.name }}
        </ion-card-title>
    </ion-card-header>
    <ion-card-content> </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline, closeCircleOutline } from "ionicons/icons";
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
  IonFooter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  modalController,
} from "@ionic/vue";
import router from "@/router";
import { Task } from "@/models/Task";
import icons from '@/components/icons';

export default defineComponent({
  name: "TaskView",
  components: {
    IonCard,
    IonIcon,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  },
  props: {
    task: Object as () => Task,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    householdName: "",
    icons,
  }),
  computed: {},
  methods: {
    dismiss() {
      modalController.dismiss();
    },
    async create() {
      await client.createHousehold(this.householdName);
      this.dismiss();
    },
  },
});
</script>

<style scoped>
</style>