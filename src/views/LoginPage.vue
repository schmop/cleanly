<template>
  <ion-page>
    <ion-content>
      <ion-item-group @keypress.enter.exact="sendForm">
        <ion-item v-if="isRegistering">
          <ion-label position="stacked" required>{{ _t('Name') }}</ion-label>
          <ion-input v-model="name" type="text" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked" required>{{ _t('Mail') }}</ion-label>
          <ion-input v-model="mail" type="email" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked" required>{{ _t('Password') }}</ion-label>
          <ion-input v-model="password" type="password" />
        </ion-item>
        <ion-item v-if="isRegistering">
          <ion-label position="stacked" required>{{ _t('Retype Password') }}</ion-label>
          <ion-input v-model="retype" type="password" />
        </ion-item>
        <ion-item button @click="sendForm" color="primary" :disabled="!formValid">
          <ion-icon slot="start" :icon="isRegistering ? logInOutline : personAddOutline" />
          {{ actionText }}
        </ion-item>
      </ion-item-group>
    </ion-content>
    <ion-footer>
      <ion-item-group>
        <ion-item>
          <ion-label position="stacked">{{ _t('Register') }}</ion-label>
          <!--
            The timestamped key fixes the infinite update loop when programmatically setting the toggle value
            @link: https://github.com/ionic-team/ionic-framework/issues/20106#issuecomment-774001524
          -->
          <ion-toggle ref="toggle" :key="isRegistering + (new Date()).toISOString()" @ionChange="onToggle"
            :checked="isRegistering" />
          <ion-button
            class="align-center"
            slot="end"
            target="_blank"
            href="https://cleanly.schmoppo.de/reset-password"
            fill="clear"
            size="small"
          >
            <ion-icon class="mr-1" :icon="openOutline"/>
            {{_t('Forgot password?')}}
          </ion-button>
        </ion-item>
      </ion-item-group>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { logInOutline, personAddOutline, openOutline } from "ionicons/icons";
import { computed, inject, ref } from "vue";
import toast from "@/toast";
import {
  IonPage,
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonFooter,
  IonToggle,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import router from "@/router";
import { _t } from "@/translation";
import { authClientSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";

const authClient = inject(authClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const isRegistering = ref(false);
const name = ref("");
const mail = ref("");
const password = ref("");
const retype = ref("");

const formValid = computed(() => !isRegistering.value || password.value === retype.value);
const actionText = computed(() => {
  if (!formValid.value) {
    return _t("Your passwords need to match!");
  }

  return isRegistering.value ? _t("Register") : _t("Login");
});

function onToggle() {
  isRegistering.value = !isRegistering.value;
}
function sendForm() {
  if (!formValid.value) {
    return;
  }
  if (isRegistering.value) {
    register();
  } else {
    login();
  }
}
async function register() {
  try {
    await authClient.signUp(name.value, mail.value, password.value);
    name.value = "";
    password.value = "";
    retype.value = "";
    mail.value = "";
    isRegistering.value = false;
    toast.info(_t("Verification mail was sent, please verify your mail address before you can log in!"));
  } catch (error: any) {
    toast.error(error.message + ', account may already exist');
  }
}
async function login() {
  try {
    await authClient.signIn(mail.value, password.value);
    await householdClient.dashboardInfo();
    toast.info(_t("Login successful!"));
    router.replace({ name: 'dashboard' });
  } catch (error: any) {
    toast.error(error.message);
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
</style>