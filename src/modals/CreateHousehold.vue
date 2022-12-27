<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Create household') }}
        <CircleXIcon @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="createHousehold()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">{{ _t('Name') }}</ion-label>
        <ion-input type="text" v-model="householdName" />
        <PencilIcon slot="end" class="align-center" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="createHousehold()">
        <CirclePlusIcon slot="start" />
        {{ _t('Create') }}
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <CircleXIcon slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { _t } from '@/translation';
import {
IonButton,
IonContent,
IonFooter,
IonHeader,
IonInput,
IonItem,
IonItemGroup,
IonLabel,
IonTitle,
IonToolbar,
modalController,
} from "@ionic/vue";
import { inject, ref } from 'vue';
import { CirclePlusIcon, CircleXIcon, PencilIcon } from 'vue-tabler-icons';
import { householdClientSymbol } from '@/dependency-injection/injection-keys';

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