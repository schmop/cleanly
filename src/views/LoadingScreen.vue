<template>
  <ion-page>
    <ion-content>
      <ion-loading :cssClass="'no-background'" spinner="circular" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { inject, onBeforeMount } from 'vue';
import { IonPage, IonContent, IonLoading } from "@ionic/vue";
import { authClientSymbol } from "@/dependency-injection/injection-keys";

const emit = defineEmits(['success', 'fail']);
const authClient = inject(authClientSymbol)!;

onBeforeMount(async () => {
  await authClient.restoreState();
  if (authClient.isAuthenticated()) {
    emit('success');
  } else {
    emit('fail');
  }
});
</script>

<style>
.no-background>.loading-wrapper {
  background: none;
  box-shadow: none;
}
</style>