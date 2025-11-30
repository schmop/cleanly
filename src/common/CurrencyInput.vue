<template>
  <div class="ancestor">
    <input
      ref="inputRef"
      type="text"
      class="ion-like-input"
      :disabled="disabled === true ? 'true' : undefined"
    >
    <ion-label class="label">
      {{ label }}
    </ion-label>
  </div>
</template>

<script setup lang="ts">
import { IonLabel } from '@ionic/vue';
import { CurrencyInputOptions, useCurrencyInput, ValueScaling } from 'vue-currency-input'
import { CURRENCY_CODE } from '@/components/HouseholdView/FinancesView/finance-types'
import { watch } from "vue";

const props = defineProps<{
  modelValue: number, // Vue 2: value
  label: string,
  disabled?: boolean,
}>();
const options: CurrencyInputOptions = {
  currency: CURRENCY_CODE,
  locale: 'de-DE',
  autoDecimalDigits: true,
  valueScaling: ValueScaling.precision,
}
const {inputRef, setValue} = useCurrencyInput(options);
watch(() => props.modelValue, setValue);

</script>

<style scoped>
.ion-like-input {
  all: unset;
  padding: 16px;
  background-color: unset;
  border-radius: 4px;
  width: 100%;
  width: -webkit-fill-available;
  width: -moz-available;
  width: fill-available;
  border: 1px solid var(--ion-color-step-300, var(--ion-background-color-step-300, #b3b3b3));

  &:hover {
    border-color: var(--ion-color-step-750, var(--ion-background-color-step-750, #404040));
  }
  &:focus {
    border-color: var(--ion-color-primary);
    border-width: 2px;
    padding: 15px;
  }
}
ion-item > .ancestor > .ion-like-input {
  padding: 12px;
  &:focus {
    padding: 11px;
  }
}
.label {
  position: absolute;
  background-color: var(--ion-card-background);
  transform: scale(0.75);
  left: 0;
  top: -10px;
  padding: 2px;
}
.ancestor {
  position: relative;
}
</style>