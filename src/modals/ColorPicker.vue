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
      <div
        v-if="usedHues.length > 0"
        class="used-colors"
      >
        <ion-label class="used-colors-label">
          {{ _t('Used colors') }}
        </ion-label>
        <div class="swatches">
          <button
            v-for="usedHue in usedHues"
            :key="usedHue"
            class="swatch"
            :class="{ 'swatch-selected': usedHue === hue }"
            :style="`background-color: ${swatchColor(usedHue).toHex()}`"
            @click="selectHue(usedHue)"
          />
        </div>
      </div>
      <VueColorPicker
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
import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css';
import { stateSymbol } from '@/dependency-injection/injection-keys';
import { __t, _t } from '@/translation';
import { IonButton, IonContent, IonFooter, IonHeader, IonLabel, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import VueColorPicker from '@radial-color-picker/vue-color-picker';
import { computed, inject, ref } from 'vue';
import { CircleXIcon, PaletteIcon } from 'vue-tabler-icons';

const emit = defineEmits(['select']);
const props = defineProps<{
  colorReceiver: EventTarget,
  startHue: number|null,
  usedHues?: number[],
}>();

const state = inject(stateSymbol)!;

const hue = ref(props.startHue ?? getDefaultTaskHue());
const darkColor = computed(() => taskColorFromHue(hue.value, true));
const lightColor = computed(() => taskColorFromHue(hue.value, false));
const color = computed(() => state.darkmode ? darkColor.value : lightColor.value);
const usedHues = computed(() => props.usedHues ?? []);
const swatchColor = (h: number) => taskColorFromHue(h, state.darkmode);

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

function selectHue(selectedHue: number) {
  hue.value = selectedHue;
}
</script>

<style scoped>

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.used-colors {
  width: 100%;
  padding: 12px 16px 0;
}

.used-colors-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.swatch-selected {
  border-color: var(--ion-color-primary);
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

.color-picker {
  aspect-ratio: 1;
  margin: 16px 0;
}

.preview-container {
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
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
