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

      <!-- Reminder: interval + unit -->
      <ion-item
        button
        @click="openReminderIntervalPicker"
      >
        <ion-label>{{ reminderLabel }}</ion-label>
        <BellIcon slot="start" />
      </ion-item>

      <!-- Reminder sub-settings (visually grouped under the interval item) -->
      <div
        v-if="reminder.enabled"
        class="reminder-sub-items"
      >
        <!-- Weekly: day-of-week chips -->
        <ion-item v-if="reminder.unit === 'weeks'">
          <div class="reminder-days">
            <ion-chip
              v-for="d in DOW_OPTIONS"
              :key="d.value"
              :color="isDayOfWeekSet(reminder.daysOfWeek, d.value) ? 'primary' : undefined"
              @click="toggleReminderDay(d.value)"
            >
              {{ _t(d.shortKey) }}
            </ion-chip>
          </div>
        </ion-item>

        <!-- Monthly: exclusive day vs weekday selector -->
        <ion-item v-if="reminder.unit === 'months'">
          <ion-segment v-model="reminder.monthlyType">
            <ion-segment-button
              value="day"
              @click="onMonthlyDayClick"
            >
              <ion-label>{{ __t('On the {0}.', reminder.monthDay) }}</ion-label>
            </ion-segment-button>
            <ion-segment-button
              value="weekday"
              @click="onMonthlyWeekdayClick"
            >
              <ion-label>{{ monthlyLabel }}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-item>

        <!-- Yearly: native date input (year irrelevant, only month+day matter) -->
        <ion-item v-if="reminder.unit === 'years'">
          <ion-input
            v-model="reminder.yearDate"
            :label="_t('Date')"
            label-placement="stacked"
            type="date"
            :min="`${currentYear}-01-01`"
            :max="`${currentYear}-12-31`"
          />
        </ion-item>

        <!-- Time of day -->
        <ion-item>
          <ion-input
            v-model="reminder.time"
            :label="_t('Time')"
            label-placement="stacked"
            type="time"
          />
          <ClockIcon
            slot="end"
            class="align-center"
          />
        </ion-item>

        <ion-item lines="none">
          <ion-note>{{ _t('With an active reminder, no notification will be sent when the task is due.') }}</ion-note>
        </ion-item>
      </div>

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
  buildReminderPayload,
  defaultReminderFormState,
  DOW_OPTIONS,
  isDayOfWeekSet,
  monthlyWeekdayShortLabel,
  reminderIntervalLabel,
  reminderToFormState,
  toggleDayOfWeek,
  WEEK_OCCURRENCE_OPTIONS,
} from "@/common/reminder";
import {
  IonButton,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  modalController,
  pickerController,
} from "@ionic/vue";
import { computed, inject, reactive, Ref, ref } from "vue";
import { BellIcon, CirclePlusIcon, CircleXIcon, ClockIcon, PaletteIcon, PencilIcon, StarIcon } from 'vue-tabler-icons';
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

// ─── Duration ────────────────────────────────────────────────────────────────

const durationModifiers = DURATION_SIZES;
const durationModifier: Ref<keyof typeof DURATION_SIZES> = ref('hours');
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

// ─── Reminder state ───────────────────────────────────────────────────────────

const reminder = reactive(defaultReminderFormState());
const currentYear = new Date().getFullYear();

// ─── Computed labels ──────────────────────────────────────────────────────────

const reminderLabel = computed(() => reminderIntervalLabel(reminder.enabled, reminder.interval, reminder.unit));
const monthlyLabel = computed(() => monthlyWeekdayShortLabel(reminder.weekOccurrence, reminder.weekDay));
const reminderPayload = computed(() => buildReminderPayload(reminder));

// ─── Picker functions ─────────────────────────────────────────────────────────

async function openReminderIntervalPicker() {
  const intervalOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => ({ text: `${n}`, value: n }));
  const unitOptions = [
    { text: _t('days'),   value: 'days'   as const },
    { text: _t('weeks'),  value: 'weeks'  as const },
    { text: _t('months'), value: 'months' as const },
    { text: _t('years'),  value: 'years'  as const },
  ];

  type ConfirmData = {
    interval: ArrayElement<typeof intervalOptions>,
    unit: ArrayElement<typeof unitOptions>,
  };

  const picker = await pickerController.create({
    columns: [
      {
        name: 'interval',
        selectedIndex: intervalOptions.findIndex(o => o.value === reminder.interval),
        options: intervalOptions,
      },
      {
        name: 'unit',
        selectedIndex: unitOptions.findIndex(o => o.value === reminder.unit),
        options: unitOptions,
      },
    ],
    buttons: [
      { text: _t('Cancel'), role: 'cancel' },
      {
        text: _t('No reminder'),
        handler: () => { reminder.enabled = false; },
      },
      {
        text: _t('Confirm'),
        handler: ({ interval, unit }: ConfirmData) => {
          reminder.enabled = true;
          reminder.interval = interval.value;
          reminder.unit = unit.value;
        },
      },
    ],
  });
  await picker.present();
}

async function openMonthDayPicker() {
  const dayOptions = [...Array(31).keys()].map(i => ({ text: `${i + 1}.`, value: i + 1 }));
  type ConfirmData = { day: ArrayElement<typeof dayOptions> };

  const picker = await pickerController.create({
    columns: [
      {
        name: 'day',
        selectedIndex: reminder.monthDay - 1,
        options: dayOptions,
      },
    ],
    buttons: [
      { text: _t('Cancel'), role: 'cancel' },
      {
        text: _t('Confirm'),
        handler: ({ day }: ConfirmData) => { reminder.monthDay = day.value; },
      },
    ],
  });
  await picker.present();
}

async function openMonthWeekdayPicker() {
  const occOptions = WEEK_OCCURRENCE_OPTIONS.map(o => ({ text: _t(o.key), value: o.value }));
  const dayOptions = DOW_OPTIONS.map(d => ({ text: _t(d.key), value: d.value }));

  type ConfirmData = {
    occurrence: ArrayElement<typeof occOptions>,
    weekday: ArrayElement<typeof dayOptions>,
  };

  const picker = await pickerController.create({
    columns: [
      {
        name: 'occurrence',
        selectedIndex: occOptions.findIndex(o => o.value === reminder.weekOccurrence),
        options: occOptions,
      },
      {
        name: 'weekday',
        selectedIndex: dayOptions.findIndex(d => d.value === reminder.weekDay),
        options: dayOptions,
      },
    ],
    buttons: [
      { text: _t('Cancel'), role: 'cancel' },
      {
        text: _t('Confirm'),
        handler: ({ occurrence, weekday }: ConfirmData) => {
          reminder.weekOccurrence = occurrence.value;
          reminder.weekDay = weekday.value;
        },
      },
    ],
  });
  await picker.present();
}

async function onMonthlyDayClick() {
  reminder.monthlyType = 'day';
  await openMonthDayPicker();
}

async function onMonthlyWeekdayClick() {
  reminder.monthlyType = 'weekday';
  await openMonthWeekdayPicker();
}

function toggleReminderDay(dow: number) {
  reminder.daysOfWeek = toggleDayOfWeek(reminder.daysOfWeek, dow);
}

// ─── Other pickers ────────────────────────────────────────────────────────────

async function colorPicker() {
  const colorReceiver = new EventTarget();
  let newHue: number|null = null;
  colorReceiver.addEventListener('color', (event) => {
    newHue = (event as CustomEvent<number>).detail;
  });
  const modal = await modalController.create({
    component: ColorPicker,
    componentProps: { colorReceiver, startHue: hue.value, usedHues: usedHues.value },
  });
  await modal.present();
  await modal.onDidDismiss();
  hue.value = Math.floor(newHue ?? hue.value);
}

async function iconPicker() {
  const iconReceiver = new EventTarget();
  let newIcon: string|null = null;
  iconReceiver.addEventListener('icon', (event) => {
    newIcon = (event as CustomEvent<string>).detail;
  });
  const modal = await modalController.create({
    component: IconPicker,
    componentProps: { iconReceiver },
  });
  await modal.present();
  await modal.onDidDismiss();
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
      { name: "count", selectedIndex: countSelectedIndex, options: countOptions },
      { name: "modifier", selectedIndex: modifierSelectedIndex, options: modifierOptions },
    ],
    buttons: [
      { text: _t("Cancel"), role: "cancel" },
      {
        text: _t("Nonrepeating"),
        handler: () => { duration.value = null; durationModifier.value = 'hours'; },
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

// ─── Submit ───────────────────────────────────────────────────────────────────

async function submit() {
  if (isEditing.value) {
    try {
      await taskClient.editTask(props.task!, taskName.value, icon.value, hue.value, calculatedDuration.value, parseInt(stars.value), reminderPayload.value);
      await toast.success(_t('Task edited successfully'));
    } catch (e) {
      await showThrownError(e, 'editing the task');
    }
  } else {
    try {
      await taskClient.addNewTask(props.id!, taskName.value, icon.value, hue.value, calculatedDuration.value, parseInt(stars.value), reminderPayload.value);
      await toast.success(_t('Task created successfully'));
    } catch (e) {
      await showThrownError(e, 'adding the task');
    }
  }
  await dismiss();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

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
  if (props.task!.reminder != null) {
    Object.assign(reminder, reminderToFormState(props.task!.reminder));
  }
}
</script>

<style scoped>
.reminder-days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 0;
}

.reminder-sub-items {
  border-inline-start: 2px solid var(--ion-color-primary);
  margin-inline-start: 16px;
}
</style>

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
