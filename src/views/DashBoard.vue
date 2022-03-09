<template>
  <ion-menu content-id="main" menu-id="dashboard-menu" side="end">
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
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="primary">
          <ion-menu-button auto-hide="false"></ion-menu-button>
        </ion-buttons>
        <ion-title size="small"> Cleanly </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="main">
      <ion-loading v-if="loading" spinner="circular" />
      <template v-else>
        <HouseholdView
          v-for="(household, index) in households"
          :household="household"
          :key="index"
        />
        <ion-card v-if="households.length === 0">
          <ion-card-header>
            <ion-card-title> No households yet... </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            To start, join a household or create one:
            <ion-button color="primary" @click="openCreateHouseholdModal">
              <ion-icon slot="start" :icon="addCircleOutline" />
              Create household
            </ion-button>
          </ion-card-content>
        </ion-card>
      </template>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
} from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
import router from "@/router";
import {
  IonPage,
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonCardHeader,
  IonModal,
  IonLoading,
  IonFooter,
  IonCardContent,
  IonMenuButton,
  IonMenu,
  IonCard,
  IonHeader,
  IonButtons,
  IonCardTitle,
  IonToolbar,
  IonTitle,
  IonList,
  IonButton,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import CreateHousehold from "@/modals/CreateHousehold.vue";
import HouseholdView from "@/components/HouseholdView.vue";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonCardHeader,
    IonLoading,
    IonMenu,
    IonButton,
    IonCard,
    IonButtons,
    IonCardTitle,
    IonMenuButton,
    IonCardContent,
    IonItem,
    IonList,
    IonTitle,
    IonHeader,
    IonIcon,
    HouseholdView,
  },
  async beforeMount() {
    await this.updateDashboard();
  },
  data: () => ({
    loading: true,
    households: [] as Household[],
    user: null as null | User,
    invites: [] as Invite[],
    addCircleOutline,
    closeCircleOutline,
    logOutOutline,
  }),
  computed: {},
  methods: {
    async updateDashboard() {
      const info = await client.dashboardInfo();
      this.households = info.households;
      this.user = info.user;
      this.invites = info.invites;
      this.loading = false;
    },
    async openCreateHouseholdModal() {
      this.close();
      const createHouseholdModal = await modalController.create({
        component: CreateHousehold,
      });
      createHouseholdModal.present();
      await createHouseholdModal.onDidDismiss();
      await this.updateDashboard();
    },
    logout() {
      this.close();
      client.logout();
      router.push("/login");
    },
    close() {
      menuController.close("dashboard-menu");
    },
  },
});
</script>

<style scoped>
</style>