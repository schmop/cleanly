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
        <ion-refresher v-if="loggedIn" slot="fixed" @ionRefresh="forceReload">
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
import MenuView from '@/components/MenuView.vue';
import { computed, inject, ref, watch } from 'vue';
import { mailOutline, homeOutline } from 'ionicons/icons';
import { Household } from '@/models/Household';
import { _t } from '@/translation';
import LoadingScreen from '@/views/LoadingScreen.vue';
import { useRoute, useRouter } from 'vue-router';
import { foregroundListenerSymbol, householdClientSymbol, stateSymbol, storeSymbol } from '@/dependency-injection/injection-keys';
import { checkAppVersion } from '@/update/update';


let triedSessionRestore = ref(false);
const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const route = useRoute();
const router = useRouter();
const householdClient = inject(householdClientSymbol)!;
const foregroundListener = inject(foregroundListenerSymbol)!;

const isDashboard = computed(() => route.name === 'dashboard');
const isLoginPage = computed(() => route.name === 'login');

const loggedIn = computed(() => state.loggedIn);
const invites = computed(() => state.invites);
const pageTitle = computed(() => state.pageTitle);

watch(
  () => state.viewedHousehold,
  () => {
    const household = state.households.find((household: Household) => household.id === state.viewedHousehold);
    store.pageTitle(household?.name ?? null);
  },
  { immediate: true }
);

async function sessionRestoreSuccess() {
  try {
    await householdClient.dashboardInfo();
  } finally {
    triedSessionRestore.value = true;
  }
  router.replace({ name: 'dashboard' });
}
function sessionRestoreFail() {
  triedSessionRestore.value = true;
  router.replace({ name: 'login' });
}
async function forceReload(event: RefresherCustomEvent) {
  await householdClient.dashboardInfo();
  event.target.complete();
}
function showInvites() {
  router.push({ name: 'invite-view' });
}

checkAppVersion();
foregroundListener.register();

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