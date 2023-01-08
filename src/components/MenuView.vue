<template>
  <ion-menu
    content-id="main"
    menu-id="menu"
    side="start"
  >
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          {{ _t('Menu') }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item
          router-link="/"
          router-direction="back"
          button
          @click="close"
        >
          <HomeIcon slot="start" />
          {{ _t('Dashboard') }}
        </ion-item>
        <ion-item
          button
          @click="openCreateHouseholdModal"
        >
          <CirclePlusIcon slot="start" />
          {{ _t('Create household') }}
        </ion-item>
        <ion-item
          button
          @click="gotoSettings"
        >
          <SettingsIcon slot="start" />
          {{ _t('Settings') }}
        </ion-item>
        <ion-item
          button
          @click="openChangelog"
        >
          <NewsIcon slot="start" />
          {{ _t('Changes') }}
        </ion-item>
        <ion-item
          button
          @click="logout"
        >
          <LogoutIcon slot="start" />
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
import { openChangelogBrowser } from "@/changelog/changelog-browser";
import { authClientSymbol, householdClientSymbol } from '@/dependency-injection/injection-keys';
import { _t } from "@/translation";
import { App } from '@capacitor/app';
import {
    IonContent,
    IonFooter,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonTitle,
    IonToolbar,
    menuController,
    modalController
} from "@ionic/vue";
import { inject, onBeforeMount, ref } from "vue";
import { routerKey } from "vue-router";
import { CirclePlusIcon, HomeIcon, LogoutIcon, NewsIcon, SettingsIcon } from "vue-tabler-icons";
import CreateHousehold from "../modals/CreateHousehold.vue";

const householdClient = inject(householdClientSymbol)!;
const authClient = inject(authClientSymbol)!;
const router = inject(routerKey)!;

const appVersion = ref('');

async function close() {
    return menuController.close("menu");
}

async function openChangelog() {
    await openChangelogBrowser();
    await close();
}

async function gotoSettings() {
    await close();
    await router.push({name: 'settings'});
}

async function openCreateHouseholdModal() {
    await close();
    const createHouseholdModal = await modalController.create({
        component: CreateHousehold,
    });
    await createHouseholdModal.present();
    await createHouseholdModal.onDidDismiss();
    await householdClient.dashboardInfo();
}

async function logout() {
    await close();
    authClient.logout();
    await router.replace({name: 'login'});
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
