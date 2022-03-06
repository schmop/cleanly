<template>
  <ion-page>
    <ion-content>
      <HouseholdView
        v-for="(household, index) in households"
        :household="household"
        :key="index"
      />
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button color="primary" @click="openCreateHouseholdModal">
          <ion-icon slot="start" :icon="addCircleOutline" />
          Create household
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline, closeCircleOutline } from "ionicons/icons";
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
  IonModal,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  modalController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import CreateHousehold from "@/modals/CreateHousehold.vue";
import HouseholdView from '@/components/HouseholdView.vue';

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    HouseholdView,
  },
  async beforeMount() {
    await this.updateDashboard();
  },
  data: () => ({
    households: [] as Household[],
    user: null as null|User,
    invites: [] as Invite[],
    addCircleOutline,
    closeCircleOutline,
  }),
  computed: {},
  methods: {
    async updateDashboard() {
      const info = await client.dashboardInfo();
      this.households = info.households;
      this.user = info.user;
      this.invites = info.invites;
    },
    async openCreateHouseholdModal() {
      const createHouseholdModal = await modalController.create({
        component: CreateHousehold,
      });
      createHouseholdModal.present();
      await createHouseholdModal.onDidDismiss();
      await this.updateDashboard();
    },
  },
});
</script>

<style scoped>
</style>