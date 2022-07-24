<template>
  <ion-app>
    <LoadingScreen v-if="!triedSessionRestore" @success="sessionRestoreSuccess" @fail="sessionRestoreFail" />
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
              <ion-menu-button :auto-hide="false"></ion-menu-button>
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

<script setup lang="ts">
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
import { computed, ref, watch } from 'vue';
import { mailOutline, homeOutline } from 'ionicons/icons';
import { container } from './container';
import { Household } from './models/Household';
import { _t } from './translation';
import LoadingScreen from './views/LoadingScreen.vue';
import { useStore } from './store/index';
import { useRoute, useRouter } from 'vue-router';


let triedSessionRestore = ref(false);
const store = useStore();
const route = useRoute();
const router = useRouter();
const isDashboard = computed(() => route.name === 'dashboard');
const isLoginPage = computed(() => route.name === 'login');

const loggedIn = computed(() => store.state.loggedIn);
const invites = computed(() => store.state.invites);
const pageTitle = computed(() => store.state.pageTitle);

watch(
  () => store.state.viewedHousehold,
  () => {
    const household = store.state.households.find((household: Household) => household.id === store.state.viewedHousehold);
    store.pageTitle(household?.name ?? null);
  },
  { immediate: true }
);

async function sessionRestoreSuccess() {
  await container.getHouseholdClient().dashboardInfo();
  router.replace({ name: 'dashboard' });
  triedSessionRestore.value = true;
}
function sessionRestoreFail() {
  router.replace({ name: 'login' });
  triedSessionRestore.value = true;
}
async function forceReload(event: RefresherCustomEvent) {
  await container.getHouseholdClient().dashboardInfo();
  event.target.complete();
}
function showInvites() {
  router.push({ name: 'invite-view' });
}

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