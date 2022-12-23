<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Color') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" class="content">
    <div class="content">
      <button v-for="color in getTaskColors()" :key="color.code" class="color-button"
        :style="`background-color: ${color.code}`" @click="select(color.code)">
        {{ color.name }}
      </button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { getTaskColors } from '@/common/task-colors';
import { _t } from '@/translation/index';
import {
IonContent,
IonHeader, IonIcon,
IonTitle, IonToolbar, modalController
} from "@ionic/vue";
import { closeCircleOutline } from "ionicons/icons";

const props = defineProps<{
  colorReceiver: EventTarget,
}>();

const emit = defineEmits(['select']);

function dismiss() {
  modalController.dismiss();
}
async function select(colorCode: string) {
  props.colorReceiver.dispatchEvent(new CustomEvent('color', { detail: colorCode }));
  emit('select', colorCode);
  dismiss();
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
}

.color-button {
  display: block;
  text-align: center;
  height: 80px;
  border-bottom: 2px solid rgb(204, 204, 204);
}
</style>