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
                                <HomeIcon />
                            </ion-button>
                        </ion-buttons>
                        <ion-buttons slot="primary">
                            <ion-menu-button :auto-hide="false"></ion-menu-button>
                        </ion-buttons>
                        <ion-buttons slot="secondary" v-if="invites.length > 0">
                            <ion-button size="large" @click="showInvites">
                                <MailIcon />
                                <ion-badge color="danger" class="button-badge">
                                    {{ invites.length }}
                                </ion-badge>
                            </ion-button>
                        </ion-buttons>
                        <ion-title size="small"> {{ pageTitle ?? _t('Cleanly') }}</ion-title>
                    </ion-toolbar>
                </ion-header>
            </template>
            <ion-content id="main">
                <ion-router-outlet ref="outlet" />
            </ion-content>
        </ion-page>
    </ion-app>
</template>

<script setup lang="ts">
import MenuView from '@/components/MenuView.vue';
import {
    colorschemeListenerSymbol,
    foregroundListenerSymbol,
    householdClientSymbol,
    stateSymbol,
    storeSymbol
} from '@/dependency-injection/injection-keys';
import { Household } from '@/models/Household';
import { _t } from '@/translation';
import { checkAppVersion } from '@/update/update';
import LoadingScreen from '@/views/LoadingScreen.vue';
import {
    IonApp,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonRouterOutlet,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HomeIcon, MailIcon } from 'vue-tabler-icons';


let triedSessionRestore = ref(false);
const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const route = useRoute();
const router = useRouter();
const householdClient = inject(householdClientSymbol)!;
const foregroundListener = inject(foregroundListenerSymbol)!;
const colorschemeListener = inject(colorschemeListenerSymbol)!;

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
    {immediate: true}
);

function openHousehold(household: Household) {
    store.viewHousehold(household.id);
    router.push({name: 'household-view'});
}

async function sessionRestoreSuccess() {
    try {
        await householdClient.dashboardInfo();
        const households = store.state.households;
        if (households.length === 1) {
            openHousehold(households[0]!);
        } else {
            await router.replace({name: 'dashboard'});
        }
    } catch (error) {
        await router.replace({name: 'login'});
    } finally {
        triedSessionRestore.value = true;
    }
}

function sessionRestoreFail() {
    triedSessionRestore.value = true;
    router.replace({name: 'login'});
}

function showInvites() {
    router.push({name: 'invite-view'});
}

checkAppVersion();
foregroundListener.register();
colorschemeListener.register();

</script>
<style scoped>
.button-badge {
    position: absolute;
    right: -8px;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
}
</style>
