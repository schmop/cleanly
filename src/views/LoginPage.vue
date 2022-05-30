<template>
  <ion-page>
    <ion-content>
      <ion-item-group @keypress.enter.exact="sendForm">
        <ion-item v-if="isRegistering">
          <ion-label position="stacked" required>{{_t('Name')}}</ion-label>
          <ion-input v-model="name" type="text" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked" required>{{_t('Mail')}}</ion-label>
          <ion-input v-model="mail" type="email" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked" required>{{_t('Password')}}</ion-label>
          <ion-input v-model="password" type="password" />
        </ion-item>
        <ion-item v-if="isRegistering">
          <ion-label position="stacked" required>{{_t('Retype Password')}}</ion-label>
          <ion-input v-model="retype" type="password" />
        </ion-item>
        <ion-item
          button
          @click="sendForm"
          color="primary"
          :disabled="!formValid"
        >
          <ion-icon
            slot="start"
            :icon="isRegistering ? logInOutline : personAddOutline"
          />
          {{ actionText }}
        </ion-item>
      </ion-item-group>
    </ion-content>
    <ion-footer>
      <ion-item-group>
        <ion-item>
          <ion-label position="stacked">{{_t('')}}Register</ion-label>
          <ion-toggle
            @ionChange="isRegistering = !isRegistering"
            :checked="isRegistering"
          />
        </ion-item>
      </ion-item-group>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { logInOutline, personAddOutline } from "ionicons/icons";
import { defineComponent } from "vue";
import client from "@/client";
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
  IonIcon,
} from "@ionic/vue";
import router from "@/router";
import { translations, _t } from "@/translation";

export default defineComponent({
  name: "LoginPage",
  components: {
    IonPage,
    IonLabel,
    IonInput,
    IonItemGroup,
    IonItem,
    IonContent,
    IonFooter,
    IonToggle,
    IonIcon,
  },
  data: () => ({
    isRegistering: false,
    name: "",
    mail: "",
    password: "",
    retype: "",
    logInOutline,
    personAddOutline,
  }),
  computed: {
    formValid() {
      return !this.isRegistering || this.password === this.retype;
    },
    actionText() {
      if (!this.formValid) {
        return _t("Your passwords need to match!");
      }

      return this.isRegistering ? _t("Register") : _t("Login");
    },
  },
  methods: {
    ...translations,
    sendForm() {
      if (!this.formValid) {
        return;
      }
      if (this.isRegistering) {
        this.register();
      } else {
        this.login();
      }
    },
    async register() {
      try {
        await client.signUp(this.name, this.mail, this.password);
        this.name = this.password = this.retype = this.mail = "";
        this.isRegistering = false;
        toast.info(_t("Register successful!"));
      } catch (error: any) {
        toast.error(error.message + ', account may already exist');
      }
    },
    async login() {
       try {
        await client.signIn(this.mail, this.password);
        toast.info(_t("Login successful!"));
        router.replace('/app');
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  },
});
</script>

<style scoped>
</style>