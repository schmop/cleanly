<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Icon') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <ion-item-group>
      <ion-item button v-for="(icon, name) in icons" :key="name" @click="select(`${name}`)">
        <ion-label>{{ name }}</ion-label>
        <ion-icon :icon="icon" />
      </ion-item>
    </ion-item-group>
  </ion-content>
</template>

<script setup lang="ts">
import { _t } from '@/translation/index';
import {
  IonContent,
  IonHeader, IonIcon, IonItem, IonItemGroup, IonLabel, IonTitle, IonToolbar, modalController
} from "@ionic/vue";
import { closeCircleOutline } from "ionicons/icons";
import icons from '../components/icons';

const props = defineProps<{
  iconReceiver: EventTarget,
}>();

const emit = defineEmits(['select']);

function dismiss() {
  modalController.dismiss();
}
async function select(icon: string) {
  props.iconReceiver.dispatchEvent(new CustomEvent('icon', { detail: icon }));
  emit('select', icon);
  dismiss();
}
</script>

<style scoped>

</style>