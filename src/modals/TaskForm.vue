<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ isEditing ? _t('Edit task') : _t('Add task') }}
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content
    color="light"
    @keypress.enter="submit()"
  >
    <ion-item-group>
      <ion-item>
        <ion-input
          v-model="taskName"
          :label="_t('Name')"
          label-placement="stacked"
          type="text"
        />
        <PencilIcon
          slot="end"
          class="align-center"
        />
      </ion-item>
      <ion-item
        button
        @click="openDurationPicker"
      >
        <ion-label>
          {{
            null !== duration
              ? __t('Repeats every {0} {1}', duration, _t(durationModifier))
              : _t('Nonrepeating')
          }}
        </ion-label>
        <ClockIcon slot="start" />
      </ion-item>
      <ion-item
        button
        lines="full"
        @click="iconPicker"
      >
        <ion-text>{{ _t(icon) }}</ion-text>
        <component
          :is="icons[icon]"
          slot="end"
        />
      </ion-item>
      <ion-item
        button
        lines="full"
        :style="`background-color: ${color}`"
        @click="colorPicker"
      >
        <ion-text>{{ _t('Color') }}</ion-text>
        <input
          slot="end"
          type="color"
          disabled
          :value="color"
          style="pointer-events: none"
        >
        <PaletteIcon slot="end" />
      </ion-item>
      <ion-item>
        <ion-input
          v-model="stars"
          :label="_t('Stars')"
          type="number"
        />
        <StarIcon
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
        :disabled="!valid"
        @click="submit()"
      >
        <CirclePlusIcon slot="start" />
        {{ isEditing ? _t('Save') : _t('Add') }}
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
import { DURATION_SIZES, exactRecurringInterval } from '@/common/time';
import { IconName, icons, isValidIcon } from "@/components/icons";
import { gettersSymbol, stateSymbol, taskClientSymbol } from "@/dependency-injection/injection-keys";
import { Task } from '@/models/Task';
import toast, { showThrownError } from "@/toast";
import { __t, _t } from "@/translation";
import { ArrayElement } from "@/types";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar,
  modalController,
  pickerController,
} from "@ionic/vue";
import { computed, inject, Ref, ref } from "vue";
import { CirclePlusIcon, CircleXIcon, ClockIcon, PaletteIcon, PencilIcon, StarIcon } from 'vue-tabler-icons';
import ColorPicker from "./ColorPicker.vue";
import IconPicker from "./IconPicker.vue";
import { entries } from "@/common/entries";

const props = defineProps<{
  id?: number,
  task?: Task,
}>();
const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;

const durationModifiers = DURATION_SIZES;
const durationModifier: Ref<keyof typeof DURATION_SIZES> = ref('days');
const duration = ref<number|null>(null);
const icon = ref<IconName>('check');
const hue = ref<number>(getDefaultTaskHue());
const taskName = ref('');
const stars = ref('0');

const color = computed(() => taskColorFromHue(hue.value, state.darkmode).toHex());
const valid = computed(() => icon.value in icons);
const usedHues = computed(() => {
  const hues = getters.tasks.value
    .filter(t => t.hue !== null)
    .map(t => t.hue as number);
  return [...new Set(hues)];
});
const calculatedDuration = computed(() => {
  if (null === duration.value) {
    return null;
  }

  return duration.value * durationModifiers[durationModifier.value];
});
const isEditing = computed(() => null != props.task);


async function colorPicker() {
  const colorReceiver = new EventTarget();
  let newHue: number|null = null;
  colorReceiver.addEventListener('color', (event) => {
    newHue = (event as CustomEvent<number>).detail;
  });
  const colorPicker = await modalController.create({
    component: ColorPicker,
    componentProps: {
      colorReceiver,
      startHue: hue.value,
      usedHues: usedHues.value,
    }
  });
  await colorPicker.present();
  await colorPicker.onDidDismiss();

  hue.value = Math.floor(newHue ?? hue.value);
}

async function iconPicker() {
  const iconReceiver = new EventTarget();
  let newIcon: string|null = null;
  iconReceiver.addEventListener('icon', (event) => {
    newIcon = (event as CustomEvent<string>).detail;
  });
  const iconPicker = await modalController.create({
    component: IconPicker,
    componentProps: {
      iconReceiver,
    }
  });
  await iconPicker.present();
  await iconPicker.onDidDismiss();

  icon.value = newIcon ?? icon.value;
}

async function dismiss() {
  await modalController.dismiss();
}

async function openDurationPicker() {
  const countOptions = [...Array(100).keys()]
    .filter((val) => val)
    .map((index) => ({text: `${index}`, value: index}));
  const countSelectedIndex = countOptions.findIndex(count => count.value === duration.value);
  const modifierOptions = entries(durationModifiers).map(
    ([text]) => ({text: _t(text), value: text, selected: text === durationModifier.value})
  );
  type ConfirmData = {
    count: ArrayElement<typeof countOptions>,
    modifier: ArrayElement<typeof modifierOptions>
  };
  const modifierSelectedIndex = modifierOptions.findIndex(modifier => modifier.value === durationModifier.value);
  const picker = await pickerController.create({
    columns: [
      {
        name: "count",
        selectedIndex: countSelectedIndex,
        options: countOptions,
      },
      {
        name: "modifier",
        selectedIndex: modifierSelectedIndex,
        options: modifierOptions,
      },
    ],
    buttons: [
      {
        text: _t("Cancel"),
        role: "cancel",
      },
      {
        text: _t("Nonrepeating"),
        handler: () => {
          duration.value = null;
          durationModifier.value = 'days';
        },
      },
      {
        text: _t("Confirm"),
        handler: ({count, modifier}: ConfirmData) => {
          duration.value = count.value;
          durationModifier.value = modifier.value;
        },
      },
    ],
  });
  await picker.present();
}

async function submit() {
  if (isEditing.value) {
    try {
      await taskClient.editTask(props.task!, taskName.value, icon.value, hue.value, calculatedDuration.value, parseInt(stars.value));
      await toast.success(_t('Task edited successfully'));
    } catch (e) {
      await showThrownError(e, 'editing the task');
    }
  } else {
    try {
      await taskClient.addNewTask(props.id!, taskName.value, icon.value, hue.value, calculatedDuration.value, parseInt(stars.value));
      await toast.success(_t('Task created successfully'));
    } catch (e) {
      await showThrownError(e, 'adding the task');
    }
  }
  await dismiss();
}

if (null == props.id && null == props.task) {
  throw new Error('TaskForm requires either a household for adding or a task for editing!')
}
if (isEditing.value) {
  taskName.value = props.task!.name;

  icon.value = isValidIcon(props.task!.icon) ? props.task!.icon : 'check';
  hue.value = props.task!.hue ?? getDefaultTaskHue();
  stars.value = props.task!.stars.toString();
  if (null === props.task!.duration) {
    duration.value = null;
  } else {
    const recurring = exactRecurringInterval(props.task!.duration);
    duration.value = recurring.times;
    durationModifier.value = recurring.format;
  }
}
</script>

<style>
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
