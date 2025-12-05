<template>
  <ion-page>
    <ion-content id="dashboard">
      <HouseholdPreview
        v-for="(household, index) in households"
        :key="index"
        :household="household"
        @click="openHousehold(household)"
      />
      <ion-card v-if="households.length === 0">
        <ion-card-header>
          <ion-card-title> {{ _t('No households yet...') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>{{ _t('To start, join a household or create one:') }}</p>
          <ion-button
            color="primary"
            @click="openCreateHouseholdModal"
          >
            <CirclePlusIcon slot="start" />
            {{ _t('Create household') }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-refresher
        slot="fixed"
        @ionRefresh="dashboardRefresher.forceReload($event)"
      >
        <ion-refresher-content />
      </ion-refresher>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HouseholdPreview from "@/components/HouseholdPreview.vue";
import {
    dashboardRefresherSymbol,
    householdClientSymbol,
    stateSymbol,
    storeSymbol
} from "@/dependency-injection/injection-keys";
import CreateHousehold from "@/modals/CreateHousehold.vue";
import { Household } from "@/models/Household";
import router from "@/router";
import { _t } from "@/translation";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    menuController,
    modalController
} from "@ionic/vue";
import { computed, inject } from "vue";
import { CirclePlusIcon } from 'vue-tabler-icons';

const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const dashboardRefresher = inject(dashboardRefresherSymbol)!;

const households = computed(() => state.households);

async function openCreateHouseholdModal() {
    await menuController.close("menu");
    const createHouseholdModal = await modalController.create({
        component: CreateHousehold,
    });
    await createHouseholdModal.present();
    await createHouseholdModal.onDidDismiss();
    await householdClient.dashboardInfo();
}

async function openHousehold(household: Household) {
    store.viewHousehold(household.id);
    await router.push({name: 'household-view'});
}
</script>

<style scoped>

</style>
