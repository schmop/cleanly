<template>
  <ion-page>
    <MenuView />
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" v-if="!isDashboard">
          <ion-button size="large" @click="goHome">
            <ion-icon size="large" slot="icon-only" :icon="homeOutline" />
          </ion-button>
        </ion-buttons>
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
        <ion-title size="small"> {{ pageTitle ?? _t('Cleanly') }} </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="main">
      <ion-loading v-if="loading" />
      <template v-else>
        <ion-refresher slot="fixed" @ionRefresh="forceReload">
          <ion-refresher-content />
        </ion-refresher>
        <ion-router-outlet />
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
  homeOutline,
  mailOutline,
} from "ionicons/icons";
import toast from "../toast";
import {RefresherCustomEvent} from "@ionic/core/components";
import router from "../router";
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
  IonBackButton,
  IonCard,
  IonRefresher,
  IonRefresherContent,
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
import { mapState } from "vuex";
import store from "../store";
import { Household } from "../models/Household";
import { translations } from "../translation";
import { householdClient } from '../client/household-client';

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonBadge,
    IonContent,
    IonToolbar,
    IonButton,
    IonRouterOutlet,
    IonLoading,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonHeader,
    IonIcon,
    MenuView,
  },
  data: () => ({
    mailOutline,
    loading: true,
    homeOutline,
  }),
  computed: {
    ...mapState(["invites", "user", "pageTitle", "households"]),
    isDashboard() {
      return this.$route.path === "/app/dashboard";
    },
  },
  watch: {
    '$route.path': {
      handler() {
        const id = parseInt(this.$route.params?.id as string);
        const household = this.households.find((household: Household) => household.id === id);
        store.commit('pageTitle', household?.name);
      },
      immediate: true,
    }
  },
  async beforeCreate() {
    if (null == this.user) {
      await householdClient.dashboardInfo();
    }
    this.loading = false;
  },
  methods: {
    ...translations,
    async forceReload(event: RefresherCustomEvent) {
      await householdClient.dashboardInfo();
      event.target.complete();
    },
    showInvites() {
      router.push("/app/invites");
    },
    goHome() {
      router.push("/app/dashboard");
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