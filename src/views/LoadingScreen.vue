<template>
  <ion-page>
    <ion-content>
        <ion-loading :cssClass="'no-background'" spinner="circular"/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent, IonLoading } from "@ionic/vue";
import router from "../router";
import { container } from "@/container";

export default defineComponent({
  name: "LoadingScreen",
  components: {
    IonPage,
    IonContent,
    IonLoading,
  },
  async beforeCreate() {
    await container.getAuthClient().restoreState();
    if (container.getAuthClient().isAuthenticated()) {
      this.$emit('success');
    } else {
      this.$emit('fail');
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