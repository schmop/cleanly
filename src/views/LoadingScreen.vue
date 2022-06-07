<template>
  <ion-page>
    <ion-content>
        <ion-loading :cssClass="'no-background'" spinner="circular"/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import client from "../client";
import { IonPage, IonContent, IonLoading } from "@ionic/vue";
import router from "../router";

export default defineComponent({
  name: "LoadingScreen",
  components: {
    IonPage,
    IonContent,
    IonLoading,
  },
  async beforeCreate() {
    await client.restoreState();
    if (client.isAuthenticated()) {
      router.replace("/app");
    } else {
      router.replace("/login");
    }
  },
});
</script>

<style>

.no-background > .loading-wrapper {
  background: none;
  box-shadow: none;
}

</style>