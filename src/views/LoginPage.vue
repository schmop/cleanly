<template>
  <ion-page>
    <ion-content>
      <ion-card class="full-screen">
        <ion-card-header>
          <ion-card-title class="center-row">
            <ion-img
              class="icon"
              :src="featureGraphic"
            />
          </ion-card-title>
          <ion-segment
            v-model="selectedPage"
          >
            <ion-segment-button value="login">
              <LoginIcon />
              <ion-label>
                {{ _t('Login') }}
              </ion-label>
            </ion-segment-button>
            <ion-segment-button value="register">
              <UserPlusIcon />
              <ion-label>
                {{ _t('Register') }}
              </ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-card-header>
        <ion-card-content class="space-between">
          <ion-item-group @keypress.enter.exact="sendForm">
            <ServerUrlInput v-model="serverUrl" />
            <ion-item v-if="isRegistering">
              <ion-label
                position="stacked"
                required
              >
                {{ _t('Name') }}
              </ion-label>
              <ion-input
                v-model="name"
                :aria-label="_t('Name')"
                type="text"
              />
            </ion-item>
            <ion-item>
              <ion-label
                position="stacked"
                required
              >
                {{ _t('Mail') }}
              </ion-label>
              <ion-input
                v-model="mail"
                :aria-label="_t('Mail')"
                type="email"
              />
            </ion-item>
            <ion-item>
              <ion-label
                position="stacked"
                required
              >
                {{ _t('Password') }}
              </ion-label>
              <ion-input
                v-model="password"
                :aria-label="_t('Password')"
                type="password"
              />
            </ion-item>
            <ion-item v-if="isRegistering">
              <ion-label
                position="stacked"
                required
              >
                {{ _t('Retype Password') }}
              </ion-label>
              <ion-input
                v-model="retype"
                :aria-label="_t('Retype Password')"
                type="password"
              />
            </ion-item>
            <ion-item
              v-if="!isRegistering"
              lines="none"
            >
              <ion-button
                slot="end"
                class="align-center"
                target="_blank"
                href="https://cleanly.schmoppo.de/reset-password"
                fill="clear"
                size="small"
              >
                <ExternalLinkIcon class="mr-1" />
                {{ _t('Forgot password?') }}
              </ion-button>
            </ion-item>
          </ion-item-group>
          <ion-button
            expand="block"
            :disabled="!formValid"
            @click="sendForm"
          >
            <UserPlusIcon
              v-if="isRegistering"
              slot="start"
            />
            <LoginIcon
              v-else
              slot="start"
            />
            {{ actionText }}
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import featureGraphic from "@img/icon.png";
import { authClientSymbol, householdClientSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import router from "@/router";
import toast, { showThrownError } from "@/toast";
import { _t } from "@/translation";
import { computed, inject, ref } from "vue";
import { ExternalLinkIcon, LoginIcon, UserPlusIcon } from 'vue-tabler-icons';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { getDefaultWebHost } from "@/client/host";
import ServerUrlInput from "@/views/ServerUrlInput.vue";

const authClient = inject(authClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const store = inject(storeSymbol)!;

const selectedPage = ref<'login' | 'register'>('login');
const name = ref('');
const mail = ref('');
const password = ref('');
const retype = ref('');
const serverUrl = ref(getDefaultWebHost());

const isRegistering = computed(() => selectedPage.value === "register");
const formValid = computed(() => !isRegistering.value || password.value === retype.value);
const actionText = computed(() => {
  if (!formValid.value) {
    return _t("Your passwords need to match!");
  }

  return isRegistering.value ? _t("Register") : _t("Login");
});

async function sendForm() {
  if (!formValid.value) {
    return;
  }
  store.setServerUrl(serverUrl.value);
  if (isRegistering.value) {
    await register();
  } else {
    await login();
  }
}

async function register() {
  try {
    const signupResponse = await authClient.signUp(name.value, mail.value, password.value);
    name.value = "";
    password.value = "";
    retype.value = "";
    mail.value = "";
    selectedPage.value = 'login';
    if (signupResponse.verification_required) {
      await toast.info(_t("Verification mail was sent, please verify your mail address before you can log in!"));
    } else {
      await toast.info(_t("Registration successful! You can now log in."));
    }
  } catch (error) {
    await showThrownError(error);
  }
}

async function login() {
  try {
    await authClient.signIn(mail.value, password.value);
    await householdClient.dashboardInfo();
    await toast.info(_t("Login successful!"));
    await router.replace({name: 'dashboard'});
  } catch (error) {
    await showThrownError(error);
  }
}
</script>

<style scoped>
.mr-1 {
  margin-right: 4px;
}

.align-center {
  align-self: center;
}

.full-screen {
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
}

.space-between {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
}

.icon {
  width: 100px;
  height: 100px;
}

.center-row {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  padding-bottom: 32px;
}

</style>