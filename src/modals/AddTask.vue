<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        Add Task
        <ion-icon
          :icon="closeCircleOutline"
          color="dark"
          @click="dismiss()"
          style="float: right"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="create()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">Name</ion-label>
        <ion-input type="text" v-model="taskName" />
      </ion-item>
      <ion-item button @click="openDurationPicker">
        <ion-label>
          Repeats every {{ duration }} {{ durationModifier }}
        </ion-label>
        <ion-icon slot="start" :icon="timeOutline" />
      </ion-item>
      <ion-item button @click="iconPicker">
        <ion-text>{{icon}}</ion-text>
        <ion-icon slot="end" :icon="icons[icon]" />
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="create()" :disabled="!valid">
        <ion-icon :icon="addCircleOutline" slot="start" />
        Add
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        Cancel
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
} from "ionicons/icons";
import client from "@/client";
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
import { openIconPicker } from "@/modals/IconPicker.vue";
import icons from "@/components/icons";

const AddTask = defineComponent({
  name: "AddTask",
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
      type: Object as () => number,
      required: true,
    },
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    timeOutline,
    taskName: "",
    icon: "checkmark",
    iconPickerOpen: false,
    icons,
    duration: 1,
    durationModifier: "Days",
    durationModifiers: {
      Days: 1,
      Weeks: 7,
      Months: 30,
      Years: 365,
    } as {[modifierName: string]: number},
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
    }
  },
  methods: {
    async iconPicker() {
      this.icon = await openIconPicker() ?? this.icon;
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
            text: "Cancel",
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
    async create() {
      await client.addNewTask(this.id, this.taskName, this.icon, this.duration);
      this.dismiss();
    },
  },
});

export default AddTask;

export async function openAddTaskModal(householdId: number) {
  menuController.close("menu");
  const addTaskModal = await modalController.create({
    component: AddTask,
    componentProps: {
      id: householdId,
    },
  });
  addTaskModal.present();
  await addTaskModal.onDidDismiss();
  await client.dashboardInfo();
}
</script>
