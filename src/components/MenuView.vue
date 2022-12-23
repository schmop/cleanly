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
        <ion-item button @click="gotoSettings">
          <ion-icon slot="start" :icon="settingsOutline" />
          {{ _t('Settings') }}
        </ion-item>
        <ion-item button @click="openChangelog">
          <ion-icon slot="start" :icon="documentTextOutline" />
          {{ _t('Changes') }}
        </ion-item>
        <ion-item button @click="logout">
          <ion-icon slot="start" :icon="logOutOutline" />
          {{ _t('Logout') }}
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-item>
        <ion-label slot="end">
          <p>{{ `Version: ${appVersion}` }}</p>
        </ion-label>
      </ion-item>
    </ion-footer>
  </ion-menu>
</template>

<script setup lang="ts">
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
  homeOutline,
  settingsOutline,
  documentTextOutline,
} from "ionicons/icons";
import {
  IonItem,
  IonContent,
  IonMenu,
  IonLabel,
  IonFooter,
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
import { inject, onBeforeMount, ref } from "vue";
import { routerKey } from "vue-router";
import { App } from '@capacitor/app';
import { openChangelogBrowser } from "@/changelog/changelog-browser";

const householdClient = inject(householdClientSymbol)!;
const authClient = inject(authClientSymbol)!;
const router = inject(routerKey)!;

const appVersion = ref('');

async function close() {
  return menuController.close("menu");
}
async function openChangelog() {
  await openChangelogBrowser();
  close();
}
function gotoSettings() {
  close();
  router.push({ name: 'settings' });
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

onBeforeMount(async () => {
  try {
    const appInfo = await App.getInfo();
    appVersion.value = appInfo.version;
  } catch (err) {
    console.warn(err);
    appVersion.value = 'Unknown Version'
  }
});
</script>

<style scoped>

</style>