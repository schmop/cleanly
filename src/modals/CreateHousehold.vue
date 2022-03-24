<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        Create household
        <ion-icon
          :icon="closeCircleOutline"
          color="dark"
          @click="dismiss()"
          style="float: right"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="create()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">Name</ion-label>
        <ion-input type="text" v-model="householdName" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="create()">
        <ion-icon :icon="addCircleOutline" slot="start" />
        Create
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        Cancel
      </ion-button>
    </ion-toolbar>
  </ion-footer>
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
  modalController,
  menuController,
} from "@ionic/vue";
import router from "@/router";
import { Household } from "@/models/Household";

const CreateHousehold = defineComponent({
  name: "CreateHousehold",
  components: {
    IonContent,
    IonToolbar,
    IonIcon,
    IonTitle,
    IonLabel,
    IonHeader,
    IonInput,
    IonItemGroup,
    IonItem,
    IonButton,
    IonFooter,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    householdName: "",
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

export default CreateHousehold;

export async function openCreateHouseholdModal() {
  menuController.close("menu");
  const createHouseholdModal = await modalController.create({
    component: CreateHousehold,
  });
  createHouseholdModal.present();
  await createHouseholdModal.onDidDismiss();
  await client.dashboardInfo();
}
</script>

<style scoped>
</style>