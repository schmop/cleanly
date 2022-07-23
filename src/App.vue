<template>
  <ion-app>
    <LoadingScreen 
      v-if="!triedSessionRestore"
      @success="sessionRestoreSuccess"
      @fail="sessionRestoreFail"
    />
    <ion-page v-else>
      <template v-if="loggedIn && !isLoginPage">
        <MenuView />
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start" v-if="!isDashboard">
              <ion-button router-link="/" size="large" router-direction="back">
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
      </template>
      <ion-content id="main">
        <ion-refresher slot="fixed" @ionRefresh="forceReload">
          <ion-refresher-content />
        </ion-refresher>
        <ion-router-outlet ref="outlet" />
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script lang="ts">
import {
  IonApp,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent
} from '@ionic/vue';
import MenuView from './components/MenuView.vue';
import { defineComponent } from 'vue';
import { mailOutline, homeOutline } from 'ionicons/icons';
import { mapState } from 'vuex';
import { container } from './container';
import { Household } from './models/Household';
import router from './router';
import store from './store';
import { translations } from './translation';
import LoadingScreen from './views/LoadingScreen.vue';
import { ViewItem } from '@ionic/vue-router/dist/types/types';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonPage,
    IonBadge,
    IonContent,
    IonToolbar,
    IonButton,
    IonRouterOutlet,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonHeader,
    IonIcon,
    MenuView,
    LoadingScreen,
  },
  inject: ['viewStacks', 'navManager'],
  data: () => ({
    mailOutline,
    homeOutline,
    triedSessionRestore: false,
  }),
  computed: {
    ...mapState(["invites", "user", "pageTitle", "households", "loggedIn", "viewedHousehold"]),
    isDashboard() {
      return this.$route.name === "dashboard";
    },
    isLoginPage() {
      return this.$route.name === 'login';
    }
  },
  watch: {
    viewedHousehold: {
      handler() {
        const household = this.households.find((household: Household) => household.id === this.viewedHousehold);
        store.commit('pageTitle', household?.name);
      },
      immediate: true,
    }
  },
  methods: {
    ...translations,
    async sessionRestoreSuccess() {
      await container.getHouseholdClient().dashboardInfo();
      router.replace({name: 'dashboard'});
      this.triedSessionRestore = true;
    },
    sessionRestoreFail() {
      router.replace({name: 'login'});
      this.triedSessionRestore = true;
    },
    async forceReload(event: RefresherCustomEvent) {
      await container.getHouseholdClient().dashboardInfo();
      event.target.complete();
    },
    showInvites() {
      router.push({name: 'invite-view'});
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