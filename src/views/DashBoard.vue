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
            <ion-icon slot="start" :icon="addCircleOutline" />
            {{ _t('Create household') }}
          </ion-button>
        </ion-card-content>
      </ion-card>
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
import { openCreateHouseholdModal } from "@/modals/CreateHousehold.vue";
import HouseholdPreview from "@/components/HouseholdPreview.vue";
import MenuView from "@/components/MenuView.vue";
import { mapState, mapMutations } from "vuex";
import { translations } from "../translation";
import client from "@/client";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonCardHeader,
    IonButton,
    IonCard,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    HouseholdPreview,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    logOutOutline,
    mailOutline,
  }),
  computed: {
    ...mapState(["user", "households", "invites"]),
  },
  methods: {
    ...translations,
    openCreateHouseholdModal,
    logout() {
      this.close();
      client.logout();
      router.push("/login");
    },
    close() {
      menuController.close("menu");
    },
    openHousehold(household: Household) {
      router.push(`/app/household/${household.id}`);
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