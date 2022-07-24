<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Create household') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="createHousehold()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">{{ _t('Name') }}</ion-label>
        <ion-input type="text" v-model="householdName" />
        <ion-icon :icon="pencilOutline" slot="end" class="align-center" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="createHousehold()">
        <ion-icon :icon="addCircleOutline" slot="start" />
        {{ _t('Create') }}
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { addCircleOutline, closeCircleOutline, pencilOutline } from "ionicons/icons";
import {
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonFooter,
  modalController,
} from "@ionic/vue";
import { householdClientSymbol } from '../dependency-injection/injection-keys';
import { _t } from '@/translation';

const householdClient = inject(householdClientSymbol)!;

const householdName = ref('');

function dismiss() {
  modalController.dismiss();
}
async function createHousehold() {
  await householdClient.createHousehold(householdName.value);
  dismiss();
}
</script>

<style scoped>
</style>