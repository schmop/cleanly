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

<script setup lang="ts">
import { householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { Household } from "@/models/Household";
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonPage, menuController, modalController
} from "@ionic/vue";
import {
  addCircleOutline
} from "ionicons/icons";
import { computed, inject, onBeforeMount } from "vue";
import HouseholdPreview from "../components/HouseholdPreview.vue";
import CreateHousehold from "../modals/CreateHousehold.vue";
import router from "../router";
import { _t } from "../translation";

const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const households = computed(() => state.households);

async function openCreateHouseholdModal() {
  menuController.close("menu");
  const createHouseholdModal = await modalController.create({
    component: CreateHousehold,
  });
  createHouseholdModal.present();
  await createHouseholdModal.onDidDismiss();
  await householdClient.dashboardInfo();
}
function openHousehold(household: Household) {
  store.viewHousehold(household.id);
  router.push({ name: 'household-view' });
}
</script>

<style scoped>

</style>