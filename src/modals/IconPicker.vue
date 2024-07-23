<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Icon') }}
        <CircleXIcon
          style="float: right"
          @click="dismiss()"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <ion-item-group>
      <ion-item
        v-for="name in iconNames"
        :key="name"
        button
        @click="select(name)"
      >
        <ion-label>{{ _t(name) }}</ion-label>
        <component :is="icons[name]" />
      </ion-item>
    </ion-item-group>
  </ion-content>
</template>

<script setup lang="ts">
import { iconNames, icons } from '@/components/icons';
import { _t } from '@/translation';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { CircleXIcon } from 'vue-tabler-icons';

const props = defineProps<{
    iconReceiver: EventTarget,
}>();

const emit = defineEmits(['select']);

async function dismiss() {
    await modalController.dismiss();
}

async function select(icon: string) {
    props.iconReceiver.dispatchEvent(new CustomEvent('icon', {detail: icon}));
    emit('select', icon);
    await dismiss();
}
</script>

<style scoped>

</style>
