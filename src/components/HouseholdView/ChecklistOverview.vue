<template>
  <ion-page>
    <ion-content>
      <ion-card
        v-for="(checklist) in checklists"
        :key="checklist.uuid"
        @click="openChecklist(checklist.uuid)"
      >
        <ion-card-header>
          <ion-card-title>
            {{ checklist.name }}
          </ion-card-title>
          <ion-button
            color="dark"
            shape="round"
            expand="full"
            @click.stop="openChecklist(checklist.uuid)"
          >
            <PencilIcon />
          </ion-button>
        </ion-card-header>
        <ion-card-content>
          {{ checklist.checklist.length }} {{ _t('entries') }}
        </ion-card-content>
      </ion-card>
      <ion-card
        v-if="checklists.length === 0"
        key="nothing-yet"
      >
        <ion-card-header>
          <ion-card-title> {{ _t('You have no checklists') }}</ion-card-title>
        </ion-card-header>
      </ion-card>
      <ion-button
        v-if="canManageChecklists"
        vertical="bottom"
        expand="full"
        horizontal="end"
        @click="createChecklist"
      >
        <PlusIcon />
        {{ _t('Create new list') }}
      </ion-button>
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
import { dashboardRefresherSymbol, gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import { Checklist } from "@/models/Household";
import router from "@/router";
import { store } from "@/store";
import { error } from "@/toast";
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
  IonRefresherContent
} from "@ionic/vue";
import { computed, ComputedRef, inject } from "vue";
import { PlusIcon } from "vue-tabler-icons";

const dashboardRefresher = inject(dashboardRefresherSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const getters = inject(gettersSymbol)!;

const canManageChecklists = computed(() => getters.canManageChecklists.value());
const household = computed(() => {
  return getters.household.value;
});
const checklists: ComputedRef<Checklist[]> = computed(() => {
  const householdId = household.value?.id;
  if (null == householdId) {
    void error('No household selected');
    return [];
  }
  return getters.checklists.value(householdId) ?? [];
});

async function createChecklist() {
  await householdClient.createChecklist(household.value!.id);
  await householdClient.dashboardInfo(); // TODO: Do not reload the whole dashboard
}

async function openChecklist(uuid: string) {
  store.openChecklist(uuid);
  await router.push({name: 'checklist'});
}
</script>

<style scoped>

</style>
