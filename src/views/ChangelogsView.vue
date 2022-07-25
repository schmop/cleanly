<template>
  <ion-page>
    <ion-content id="changelogs">
      <ion-card class="card" v-for="(changelog, index) in changelogsHtml" :key="index">
        <div v-html="changelog"></div>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { inject, onBeforeMount } from 'vue';
import { IonPage, IonContent, IonCard } from "@ionic/vue";
import { authClientSymbol } from "@/dependency-injection/injection-keys";
import changelogs from '../../changelog.md';
import {Marked} from '@ts-stack/markdown';

const emit = defineEmits(['success', 'fail']);
const authClient = inject(authClientSymbol)!;

const changelogsHtml = (changelogs as string)
  .split('# ')
  .filter(changelog => changelog.trim().length)
  .map((changelog) =>  Marked.parse(`# ${changelog}`));

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
.card {
  padding: 16px;
}
#changelogs img {
  border: 1px solid white !important;
  border-radius: 4px;
  display: block;
}
</style>