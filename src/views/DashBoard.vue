<template>
  <ion-page>
    <ion-content id="dashboard">
      <HouseholdPreview v-for="(household, index) in households" @click="openHousehold(household)"
        :household="household" :key="index" />
      <ion-card v-if="households.length === 0">
        <ion-card-header>
          <ion-card-title> {{ _t('No households yet...') }} </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          {{ _t('To start, join a household or create one:') }}
          <ion-button color="primary" @click="openCreateHouseholdModal">
            <ion-icon slot="start" :icon="addCircleOutline" />
            {{ _t('Create household') }}
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
  mailOutline,
} from "ionicons/icons";
import router from "../router";
import {
  IonPage,
  IonContent,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonCardTitle,
  IonButton,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import { Household } from "../models/Household";
import HouseholdPreview from "../components/HouseholdPreview.vue";
import { translations } from "../translation";
import CreateHousehold from "../modals/CreateHousehold.vue";
import { container } from "@/container";
import { store } from "@/store";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonCardHeader,
    IonButton,
    IonCard,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    HouseholdPreview,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    logOutOutline,
    mailOutline,
  }),
  computed: {
    households() {
      return store.state.households;
    }
  },
  methods: {
    ...translations,
    async openCreateHouseholdModal() {
      menuController.close("menu");
      const createHouseholdModal = await modalController.create({
        component: CreateHousehold,
      });
      createHouseholdModal.present();
      await createHouseholdModal.onDidDismiss();
      await container.getHouseholdClient().dashboardInfo();
    },
    logout() {
      this.close();
      container.getAuthClient().logout();
      router.push("/login");
    },
    close() {
      menuController.close("menu");
    },
    openHousehold(household: Household) {
      store.commit('viewHousehold', household.id);
      router.push({name: 'household-view'});
    },
  },
});
</script>

<style scoped>
</style>