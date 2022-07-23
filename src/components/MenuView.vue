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
        <ion-item button @click="logout">
          <ion-icon slot="start" :icon="logOutOutline" />
          {{ _t('Logout') }}
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
  homeOutline,
} from "ionicons/icons";
import router from "../router";
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
import { Household } from "../models/Household";
import { User } from "../models/User";
import { Invite } from "../models/Invite";
import { translations } from "../translation";
import CreateHousehold from "../modals/CreateHousehold.vue";
import { container } from "@/container";

export default defineComponent({
  name: "MenuView",
  components: {
    IonContent,
    IonToolbar,
    IonMenu,
    IonItem,
    IonList,
    IonTitle,
    IonHeader,
    IonIcon,
  },
  data: () => ({
    loading: true,
    households: [] as Household[],
    user: null as null | User,
    invites: [] as Invite[],
    addCircleOutline,
    closeCircleOutline,
    homeOutline,
    logOutOutline,
  }),
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
    async logout() {
      await this.close();
      container.getAuthClient().logout();
      router.replace("/login");
    },
    async close() {
      return menuController.close("menu");
    },
  },
});
</script>

<style scoped>
</style>