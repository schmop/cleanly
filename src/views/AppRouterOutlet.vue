<template>
  <ion-page>
    <MenuView />
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="primary">
          <ion-menu-button auto-hide="false"></ion-menu-button>
        </ion-buttons>
        <ion-buttons slot="secondary" v-if="invites.length > 0">
          <ion-button size="large" @click="showInvites">
            <ion-icon size="large" slot="icon-only" :icon="mailOutline" />
            <ion-badge color="danger" class="button-badge">
              {{ invites.length }}
            </ion-badge>
          </ion-button>
        </ion-buttons>
        <ion-title size="small"> Cleanly </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="main">
      <ion-router-outlet />
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
  IonRouterOutlet,
  IonBadge,
  IonList,
  IonButton,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import MenuView from "@/components/MenuView.vue";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonBadge,
    IonContent,
    IonToolbar,
    IonButton,
    IonRouterOutlet,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonHeader,
    IonIcon,
    MenuView,
  },
  data: () => ({
    mailOutline,
  }),
  computed: {
    invites() {
      return [1];
    },
  },
  methods: {
    showInvites() {
      router.push("/app/invites");
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