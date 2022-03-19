<template>
  <ion-page>
    <ion-content id="dashboard">
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
  mailOutline,
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
import {openCreateHouseholdModal} from "@/modals/CreateHousehold.vue";
import HouseholdView from "@/components/HouseholdView.vue";
import MenuView from "@/components/MenuView.vue";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonCardHeader,
    IonLoading,
    IonButton,
    IonCard,
    IonCardTitle,
    IonCardContent,
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
    mailOutline,
    openCreateHouseholdModal,
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
.button-badge {
  position: absolute;
  right: -6px;
  top: -9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>