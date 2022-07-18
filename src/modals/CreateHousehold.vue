<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Create household') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="createHousehold()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">{{ _t('Name') }}</ion-label>
        <ion-input type="text" v-model="householdName" />
        <ion-icon :icon="pencilOutline" slot="end" class="align-center" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="createHousehold()">
        <ion-icon :icon="addCircleOutline" slot="start" />
        {{ _t('Create') }}
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline, closeCircleOutline, pencilOutline } from "ionicons/icons";
import toast from "../toast";
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
import router from "../router";
import { Household } from "../models/Household";
import { translations } from "../translation";
import { container } from "@/container";

export default defineComponent({
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
    pencilOutline,
    householdName: "",
  }),
  methods: {
    ...translations,
    dismiss() {
      modalController.dismiss();
    },
    async createHousehold() {
      await container.getHouseholdClient().createHousehold(this.householdName);
      this.dismiss();
    },
  },
});
</script>

<style scoped>
</style>