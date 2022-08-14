<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ isEditing ? __t('Edit task') : _t('Add task') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="submit()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">{{_t('Name')}}</ion-label>
        <ion-input type="text" v-model="taskName" />
        <ion-icon :icon="pencilOutline" slot="end" class="align-center" />
      </ion-item>
      <ion-item button @click="openDurationPicker">
        <ion-label>
          {{ __t('Repeats every {0} {1}', duration, _t(durationModifier)) }}
        </ion-label>
        <ion-icon slot="start" :icon="timeOutline" />
      </ion-item>
      <ion-item button @click="iconPicker" lines="full">
        <ion-text>{{ icon }}</ion-text>
        <ion-icon slot="end" :icon="icons[icon]" />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">{{_t('Stars')}}</ion-label>
        <ion-input type="number" v-model="stars" />
        <ion-icon :icon="starOutline" slot="end" class="align-center" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="submit()" :disabled="!valid">
        <ion-icon :icon="addCircleOutline" slot="start" />
        {{ _t('Add') }}
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  timeOutline,
  pencilOutline,
starOutline,
} from "ionicons/icons";
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
  IonText,
  modalController,
  pickerController,
} from "@ionic/vue";
import icons from "../components/icons";
import { DURATION_SIZES, exactRecurringInterval } from '../common/time';
import { _t, __t } from "../translation";
import { Task } from '../models/Task';
import IconPicker from "./IconPicker.vue";
import { taskClientSymbol } from "@/dependency-injection/injection-keys";

const props = defineProps<{
  id?: number,
  task?: Task,
}>();
const taskClient = inject(taskClientSymbol)!;

const durationModifiers = DURATION_SIZES;
const durationModifier: Ref<keyof typeof DURATION_SIZES> = ref('days');
const duration = ref(1);
const icon = ref('checkmark');
const taskName = ref('');
const stars = ref('0');

const valid = computed(() => icon.value in icons);
const calculatedDuration = computed(() => duration.value * durationModifiers[durationModifier.value]);
const isEditing = computed(() => null != props.task);


async function iconPicker() {
  const iconReceiver = new EventTarget();
  let newIcon = null as null | string;
  iconReceiver.addEventListener('icon', (event) => {
    newIcon = (event as CustomEvent).detail;
  });
  const iconPicker = await modalController.create({
    component: IconPicker,
    componentProps: {
      iconReceiver,
    }
  });
  iconPicker.present();
  await iconPicker.onDidDismiss();

  icon.value = newIcon ?? icon.value;
}
function dismiss() {
  modalController.dismiss();
}
async function openDurationPicker() {
  const countOptions = [...Array(100).keys()]
          .filter((val) => val)
          .map((index) => ({ text: `${index}`, value: index }));
  const countSelectedIndex = countOptions.findIndex(count => count.value === duration.value);
  const modifierOptions = Object.entries(durationModifiers).map(
    ([text]) => ({ text: _t(text), value: text , selected: text === durationModifier.value})
  );
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
        text: _t("Confirm"),
        handler: ({ count, modifier }) => {
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
    await taskClient.editTask(props.task!, taskName.value, icon.value, calculatedDuration.value, parseInt(stars.value));
  } else {
    await taskClient.addNewTask(props.id!, taskName.value, icon.value, calculatedDuration.value, parseInt(stars.value));
  }
  dismiss();
}

if (null == props.id && null == props.task) {
  throw new Error('TaskForm requires either a household for adding or a task for editing!')
}
if (isEditing.value) {
  taskName.value = props.task!.name;
  const recurring = exactRecurringInterval(props.task!.duration);
  duration.value = recurring.times;
  durationModifier.value = recurring.format;
  icon.value = props.task!.icon;
  stars.value = props.task!.stars.toString();
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