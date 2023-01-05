<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Create household') }}
        <CircleXIcon
          style="float: right"
          @click="dismiss()"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content
    color="light"
    @keypress.enter="createHousehold()"
  >
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">
          {{ _t('Name') }}
        </ion-label>
        <ion-input
          v-model="householdName"
          type="text"
        />
        <PencilIcon
          slot="end"
          class="align-center"
        />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button
        color="primary"
        @click="createHousehold()"
      >
        <CirclePlusIcon slot="start" />
        {{ _t('Create') }}
      </ion-button>
      <ion-button
        color="light"
        @click="dismiss()"
      >
        <CircleXIcon slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { householdClientSymbol } from '@/dependency-injection/injection-keys';
import { showThrownError } from "@/toast";
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

const householdClient = inject(householdClientSymbol)!;

const householdName = ref('');

async function dismiss() {
    await modalController.dismiss();
}

async function createHousehold() {
    try {

        await householdClient.createHousehold(householdName.value);
    } catch (err) {
        await showThrownError(err);
    }
    await dismiss();
}
</script>

<style scoped>
</style>
