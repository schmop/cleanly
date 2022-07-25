<template>
  <ion-menu content-id="main" menu-id="menu" side="end">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          {{ _t('Menu') }}
          <ion-icon :icon="closeCircleOutline" color="dark" @click="close" style="float: right" />
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item router-link="/" router-direction="back" button @click="close">
          <ion-icon slot="start" :icon="homeOutline" />
          {{ _t('Dashboard') }}
        </ion-item>
        <ion-item button @click="openCreateHouseholdModal">
          <ion-icon slot="start" :icon="addCircleOutline" />
          {{ _t('Create household') }}
        </ion-item>
        <ion-item button @click="gotoChangelog">
          <ion-icon slot="start" :icon="documentTextOutline" />
          {{ _t('Changes') }}
        </ion-item>
        <ion-item button @click="logout">
          <ion-icon slot="start" :icon="logOutOutline" />
          {{ _t('Logout') }}
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
  homeOutline,
  documentTextOutline,
} from "ionicons/icons";
import {
  IonItem,
  IonContent,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonIcon,
  menuController,
  modalController,
} from "@ionic/vue";
import CreateHousehold from "../modals/CreateHousehold.vue";
import { _t } from "@/translation";
import { householdClientSymbol, authClientSymbol } from '../dependency-injection/injection-keys';
import { inject } from "vue";
import { routerKey } from "vue-router";

const householdClient = inject(householdClientSymbol)!;
const authClient = inject(authClientSymbol)!;
const router = inject(routerKey)!;

async function close() {
  return menuController.close("menu");
}
function gotoChangelog() {
  close();
  router.push({name: 'changelogs'});
}
async function openCreateHouseholdModal() {
  close()
  const createHouseholdModal = await modalController.create({
    component: CreateHousehold,
  });
  createHouseholdModal.present();
  await createHouseholdModal.onDidDismiss();
  await householdClient.dashboardInfo();
}
async function logout() {
  await close();
  authClient.logout();
  router.replace({ name: 'login' });
}
</script>

<style scoped>
</style>