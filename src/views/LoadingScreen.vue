<template>
  <ion-page>
    <ion-content>
        <ion-loading spinner="circular"/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import client from "@/client";
import { IonPage, IonContent, IonLoading } from "@ionic/vue";
import router from "@/router";

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
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  },
});
</script>

<style scoped>
</style>