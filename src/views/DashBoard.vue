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
                        <CirclePlusIcon slot="start" />
                        {{ _t('Create household') }}
                    </ion-button>
                </ion-card-content>
            </ion-card>

            <ion-refresher slot="fixed" @ionRefresh="forceReload">
                <ion-refresher-content />
            </ion-refresher>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { Household } from "@/models/Household";
import {
    IonButton, IonRefresher, IonRefresherContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonPage, menuController, modalController
} from "@ionic/vue";
import { computed, inject } from "vue";
import { CirclePlusIcon } from 'vue-tabler-icons';
import HouseholdPreview from "@/components/HouseholdPreview.vue";
import CreateHousehold from "@/modals/CreateHousehold.vue";
import router from "@/router";
import { _t } from "@/translation";
import { forceReload } from '@/app-state/pull-to-refresh';

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
