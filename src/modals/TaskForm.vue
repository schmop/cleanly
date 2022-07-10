<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Add Task') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="submit()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">Name</ion-label>
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

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  timeOutline,
  pencilOutline,
} from "ionicons/icons";
import client from "../client";
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
  menuController,
  pickerController,
} from "@ionic/vue";
import icons from "../components/icons";
import { DURATION_SIZES } from "../common/time";
import { _t, translations } from "../translation";
import {Task} from '../models/Task';
import IconPicker from "./IconPicker.vue";

export default defineComponent({
  name: "TaskForm",
  components: {
    IonContent,
    IonToolbar,
    IonIcon,
    IonTitle,
    IonLabel,
    IonText,
    IonHeader,
    IonInput,
    IonItemGroup,
    IonItem,
    IonButton,
    IonFooter,
  },
  props: {
    id: {
      type: Number,
      default: null,
    },
    task: {
      type: Object as () => Task,
      default: null, 
    },
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    timeOutline,
    pencilOutline,
    taskName: "",
    icon: "checkmark",
    iconPickerOpen: false,
    icons,
    duration: 1,
    durationModifier: "days",
    durationModifiers: DURATION_SIZES,
  }),
  computed: {
    valid() {
      return this.icon in icons;
    },
    durationModifierValue() {
      return (this.durationModifiers as any)[this.durationModifier];
    },
    calculatedDuration() {
      return this.duration * this.durationModifiers[this.durationModifier];
    },
    isEditing() {
      return this.task !== null;
    }
  },
  beforeMount() {
    if (null === this.id && null === this.task) {
      throw new Error('TaskForm requires either a household for adding or a task for editing!')
    }
    if (this.isEditing) {
      this.taskName = this.task.name;
      this.duration = this.task.duration;
      this.icon = this.task.icon;
    }
  },
  methods: {
    ...translations,
    async iconPicker() {
      const iconReceiver = new EventTarget();
      let icon = null as null | string;
      iconReceiver.addEventListener('icon', (event) => {
        icon = (event as CustomEvent).detail;
      });
      const iconPicker = await modalController.create({
        component: IconPicker,
        componentProps: {
          iconReceiver,
        }
      });
      iconPicker.present();
      await iconPicker.onDidDismiss();

      this.icon = icon ?? this.icon;
    },
    dismiss() {
      modalController.dismiss();
    },
    async openDurationPicker() {
      const picker = await pickerController.create({
        columns: [
          {
            name: "count",
            options: [...Array(100).keys()]
              .filter((val) => val)
              .map((index) => ({ text: `${index}`, value: index })),
          },
          {
            name: "modifier",
            options: Object.entries(this.durationModifiers).map(
              ([text, value]) => ({ text, value })
            ),
          },
        ],
        buttons: [
          {
            text: _t("Cancel"),
            role: "cancel",
          },
          {
            text: "Confirm",
            handler: ({ count, modifier }) => {
              this.duration = count.value;
              this.durationModifier = modifier.text;
            },
          },
        ],
      });
      await picker.present();
    },
    async submit() {
      if (this.isEditing) {
        await client.editTask(this.task, this.taskName, this.icon, this.calculatedDuration);
      } else {
        await client.addNewTask(this.id, this.taskName, this.icon, this.calculatedDuration);
      }
      this.dismiss();
    },
  },
});
</script>