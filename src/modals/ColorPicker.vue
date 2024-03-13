<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Color') }}
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <div class="content">
      <color-picker
        class="color-picker"
        :hue="color.hue"
        :saturation="color.saturation"
        :luminosity="color.luminosity"
        @input="onColorChange"
        @select="select()"
      />
      <div class="preview-container dark-preview">
        <div
          class="preview"
          :style="`background-color: ${darkColor.toHex()}`"
        >
          {{
            __t('{0} left', '0 ' + _t('hours'))
          }}
        </div>
      </div>
      <div class="preview-container light-preview">
        <div
          class="preview"
          :style="`background-color: ${lightColor.toHex()}`"
        >
          {{
            __t('{0} left', '0 ' + _t('hours'))
          }}
        </div>
      </div>
    </div>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button
        color="primary"
        @click="select()"
      >
        <PaletteIcon slot="start" />
        {{ _t('Select') }}
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
import { getDefaultTaskHue, taskColorFromHue } from '@/common/task-colors';
import { stateSymbol } from '@/dependency-injection/injection-keys';
import { __t, _t } from '@/translation';
import { IonButton, IonContent, IonFooter, IonHeader, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import ColorPicker from '@radial-color-picker/vue-color-picker';
import { computed, inject, ref } from 'vue';
import { CircleXIcon, PaletteIcon } from 'vue-tabler-icons';

const emit = defineEmits(['select']);
const props = defineProps<{
  colorReceiver: EventTarget,
  startHue: number|null,
}>();

const state = inject(stateSymbol)!;

const hue = ref(props.startHue ?? getDefaultTaskHue());
const darkColor = computed(() => taskColorFromHue(hue.value, true));
const lightColor = computed(() => taskColorFromHue(hue.value, false));
const color = computed(() => state.darkmode ? darkColor.value : lightColor.value);

async function dismiss() {
  await modalController.dismiss();
}

function onColorChange(newHue: number) {
  hue.value = newHue;
}

async function select() {
  props.colorReceiver.dispatchEvent(new CustomEvent('color', {detail: hue.value}));
  emit('select', hue.value);
  await dismiss();
}
</script>

<style scoped>
@import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css';

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.color-picker {
  aspect-ratio: 1;
  margin: 16px 0;
}

.preview-container {
  width: stretch;
  padding: 16px;
  margin: 4px 16px;
  border-radius: 4px;
}

.preview {
  width: 100%;
  height: 40px;
  padding: 4px;
  text-align: center;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
</style>

<style>
.md .dark-preview {
  color: #fff;
  background-color: #121212;
}

.ios .dark-preview {
  color: #fff;
  background-color: #000;
}

.light-preview {
  color: #000;
  background-color: #fff;
}
</style>
