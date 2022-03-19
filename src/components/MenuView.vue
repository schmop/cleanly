<template>
  <ion-menu content-id="main" menu-id="menu" side="end">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          Menu
          <ion-icon
            :icon="closeCircleOutline"
            color="dark"
            @click="close"
            style="float: right"
          />
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item button @click="gotoDashboard">
          <ion-icon slot="start" :icon="homeOutline" />
          Dashboard
        </ion-item>
        <ion-item button @click="openCreateHouseholdModal">
          <ion-icon slot="start" :icon="addCircleOutline" />
          Create Household
        </ion-item>
        <ion-item button @click="logout">
          <ion-icon slot="start" :icon="logOutOutline" />
          Logout
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
import client from "@/client";
import router from "@/router";
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
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import HouseholdView from "@/components/HouseholdView.vue";
import {openCreateHouseholdModal} from "@/modals/CreateHousehold.vue";

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
    openCreateHouseholdModal,
    gotoDashboard() {
        this.close();
        router.push('/app/dashboard');
    },
    logout() {
      this.close();
      client.logout();
      router.push("/login");
    },
    close() {
      menuController.close("menu");
    },
  },
});
</script>

<style scoped>
</style>