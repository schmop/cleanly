<template>
  <ion-card
    class="focus-no-highlight"
    :class="{ 'danger': overdue }"
    tabindex="-1"
    @click="toggleActions"
    @blur.capture="closeActions"
  >
    <ion-card-header
      v-if="task"
      class="pb-0"
    >
      <ion-card-title>
        <div>
          <component
            :is="icons[icon]"
            class="vertical-center"
          />
          <span class="vertical-center">{{ task.name }}</span>
        </div>
      </ion-card-title>
    </ion-card-header>
    <ion-card-content class="flex">
      <div class="center">
        <span class="small row">
          {{ durationText }}
        </span>
        <span
          v-if="assignee"
          class="small row"
        >
          <UserIcon />
          {{ assignee.name }}
        </span>
        <div class="flex-end row">
          <ion-text
            v-if="task.stars > 0"
            color="warning"
          >
            <span class="vertical-center">{{ task.stars }}</span>
            <StarIcon class="vertical-center" />
          </ion-text>
          <template v-if="canManageTasks && showActions">
            <ion-buttons>
              <ion-button
                :id="contextMenuId"
                @click.stop="() => {/** Noop */ }"
              >
                <DotsVerticalIcon slot="icon-only" />
              </ion-button>
            </ion-buttons>
            <ion-popover
              :trigger="contextMenuId"
              dismiss-on-select
            >
              <ion-content>
                <ion-list>
                  <ion-item
                    button
                    lines="none"
                    @click="editTask"
                  >
                    <PencilIcon slot="start" />
                    <ion-label> {{ _t('Edit task') }}</ion-label>
                  </ion-item>
                  <ion-item
                    button
                    lines="none"
                    @click="assignTo"
                  >
                    <UserCheckIcon slot="start" />
                    <ion-label> {{ _t('Assign to') }}</ion-label>
                  </ion-item>
                  <ion-item
                    button
                    lines="none"
                    @click="deleteTask"
                  >
                    <TrashXIcon slot="start" />
                    <ion-label> {{ _t('Delete task') }}</ion-label>
                  </ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </template>
        </div>
      </div>
      <template v-if="useSwipe">
        <div
          ref="slider"
          class="w-100 slider"
          @mousedown="startDrag"
          @mouseup="endDrag"
          @mousemove="drag"
          @touchstart="startDrag"
          @touchend="endDrag"
          @touchcancel="endDrag"
          @touchmove="drag"
        >
          <div class="progress-background soft">
            <div
              class="progress"
              :style="taskColor"
            >
              {{ dueInText }}
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="w-100">
          <div class="progress-background soft">
            <div
              class="progress"
              :style="taskColor"
            >
              {{ dueInText }}
            </div>
          </div>
        </div>
        <transition name="actions">
          <div
            v-show="actionsVisible"
            class="w-100"
          >
            <ion-button
              expand="block"
              color="tertiary"
              @click.stop="markDone"
            >
              {{ _t('Mark done') }}
            </ion-button>
          </div>
        </transition>
      </template>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { confirmablePrompt } from "@/alert/prompt";
import { getDefaultTaskHue, taskColorFromHue } from "@/common/task-colors";
import { taskOverDue } from "@/common/task-priority";
import { DAY_IN_HOURS, formatHours, HOUR_IN_SECONDS, roundedRecurringInterval, secondsSince } from "@/common/time";
import { icons, isValidIcon } from "@/components/icons";
import {
  gettersSymbol,
  householdClientSymbol,
  stateSymbol,
  storeSymbol,
  taskClientSymbol
} from '@/dependency-injection/injection-keys';
import TaskForm from "@/modals/TaskForm.vue";
import { Household } from "@/models/Household";
import { Task } from "@/models/Task";
import toast, { showThrownError, success } from "@/toast";
import { __t, _t } from "@/translation";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonText,
  modalController,
  PickerColumn,
  PickerColumnOption,
  pickerController,
} from "@ionic/vue";
import { computed, inject, ref } from 'vue';
import { DotsVerticalIcon, PencilIcon, StarIcon, TrashXIcon, UserCheckIcon, UserIcon } from 'vue-tabler-icons';
import confetti from 'canvas-confetti';


const props = defineProps<{
  task: Task,
  showActions: boolean,
  household: Household,
}>();
const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const actionsVisible = ref(false);

const useSwipe = computed(() => state.userSettings.swipeToFinishTasks);
const icon = computed(() => isValidIcon(props.task.icon) ? props.task.icon : 'check');
const assignee = computed(() => props.household.users.find((user) => user.id === props.task.assignee));
const contextMenuId = computed(() => `task-contextmenu-${props.task.id}`);
const canManageTasks = computed(() => null !== state.user && getters.canManageTasks.value(state.user.id, props.household));
const overdue = computed(() => taskOverDue(props.task));
const taskColor = computed(() => `background-color: ${taskColorFromHue(props.task.hue ?? getDefaultTaskHue(), state.darkmode).toHex()}`);
const durationText = computed(() => roundedRecurringInterval(props.task.duration));
const dueInText = computed(() => {
  const {lastComplete} = props.task;

  if (null == lastComplete) {
    return _t('Never done before');
  }
  const lastCompleteHours = secondsSince(lastComplete) / HOUR_IN_SECONDS;
  if (null === props.task.duration) {
    return __t('Last done {0}', formatHours(lastCompleteHours));
  }
  const durationHours = props.task.duration * DAY_IN_HOURS;
  const hoursLeft = durationHours - lastCompleteHours;
  if (hoursLeft < 0) {
    return __t('Overdue for {0}', formatHours(-hoursLeft));
  }

  return __t('{0} left', formatHours(hoursLeft));
});

async function deleteTask() {
  if (!await confirmablePrompt(
    _t('Delete task'),
    _t('Delete'),
    _t('Are you sure you want to delete this task? All activity entries and corresponding stars will be lost.'
    ))) {
    return;
  }
  try {
    await taskClient.deleteTask(props.task.id);
    store.removeTask(props.task.id);
    await toast.success(_t('Task deleted successfully'));
  } catch (e) {
    await toast.error(_t('Could not delete task'));
  }
}

async function assignTo() {
  const assigneeColumn: PickerColumn = {
    name: 'assignee',
    options: props.household.users.map(
      (user) => ({
        value: user.id,
        text: user.name,
      }),
    ),
  };
  if (props.task.assignee !== null) {
    assigneeColumn.selectedIndex = assigneeColumn.options.findIndex(
      (option) => option.value === props.task.assignee
    );
  }
  const picker = await pickerController.create({
    columns: [assigneeColumn],
    buttons: [
      {
        text: _t("Cancel"),
        role: "cancel",
      },
      {
        text: _t("Unassign"),
        role: "unassign",
      },
      {
        text: _t("Confirm"),
        role: "confirm",
      },
    ],
  });
  await picker.present();
  const dismiss = await picker.onDidDismiss<{assignee: PickerColumnOption}>();
  if (undefined === dismiss.role || !['confirm', 'unassign'].includes(dismiss.role)) {
    return;
  }
  let userId: unknown = dismiss.data?.assignee.value;
  if (dismiss.role === 'unassign') {
    userId = null;
  }
  if (typeof userId !== 'number') {
    userId = null;
  }
  // typescript is not smart enough to know that userId is a number or null here
  if (!numberOrNull(userId)) {
    return;
  }

  try {
    await taskClient.assignTo(props.task, userId);
    store.assignTask(props.household.id, props.task.id, userId);
    await success(_t('Task assigned successfully!'));
  } catch (err) {
    await showThrownError(err);
  }
}

function numberOrNull(a: unknown): a is number|null {
  return a === null || typeof a === 'number';
}

async function editTask() {
  const taskFormModal = await modalController.create({
    component: TaskForm,
    componentProps: {
      task: props.task,
    },
  });
  await taskFormModal.present();
  await taskFormModal.onDidDismiss();
  await householdClient.dashboardInfo();
}

async function markDone(): Promise<boolean> {
  if (props.task.id != null) {
    try {
      actionsVisible.value = false;
      const response = await taskClient.markTaskComplete(props.task.id);
      store.markTaskDone(props.household.id, props.task.id, response.timestamp);
      store.assignTask(props.household.id, props.task.id, response.assignee?.id ?? null)
      void toast.success(_t('Task done'));
      const householdId = props.household.id;
      if (null != householdId) {
        await householdClient.retrieveStars(householdId);
        return true;
      }
    } catch (err) {
      await showThrownError(err);
    }
  }
  return false;
}

function toggleActions(event: MouseEvent) {
  if (!props.showActions) {
    return;
  }
  actionsVisible.value = !actionsVisible.value;
  const card = event.currentTarget;
  if ((card instanceof HTMLElement)) {
    card.focus();
  }
}

function closeActions(event: FocusEvent) {
  const card = event.currentTarget;
  const target = event.relatedTarget;
  if (!(card instanceof HTMLElement)) {
    return;
  }
  if (target instanceof HTMLElement && card.contains(target)) {
    return;
  }

  actionsVisible.value = false;
}

// Slider
const slider = ref<HTMLDivElement | null>(null);
type Position = {x: number, y: number};
function positionFromEvent(event: MouseEvent | TouchEvent): Position {
  if (event instanceof MouseEvent) {
    return {x: event.clientX, y: event.clientY};
  }
  return {x: event.touches[0]!.clientX, y: event.touches[0]!.clientY};
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
let startPos: Position|null = null;
let lastPos: Position|null = null;
let startWidth: number = 0;
let swipeStarted: boolean = false;
function reset() {
  startPos = null;
  lastPos = null;
  swipeStarted = false;
}
function startDrag(event: MouseEvent | TouchEvent) {
  if (null === slider.value || !props.showActions) {
    return;
  }
  slider.value.style.transition = 'width 0 ease, left 0 ease';
  startWidth = slider.value.getBoundingClientRect().width;
  lastPos = startPos = positionFromEvent(event);
}
function drag(event: MouseEvent | TouchEvent) {
  if (null === slider.value || startPos === null) {
    reset();
    return;
  }
  const pos = positionFromEvent(event);
  const movement = pos.x - startPos.x;
  if (!swipeStarted && Math.abs(movement) < 30) {
    return;
  }
  swipeStarted = true;
  const width = clamp((startWidth - Math.abs(movement)) / startWidth * 100, 0, 100);
  const swipeWouldTrigger = Math.abs(movement) > startWidth / 2;
  slider.value.style.width = `${width}%`;
  slider.value.style.left = `${clamp(movement, 0, startWidth)}px`;
  slider.value.style.transition = 'width 0s ease, left 0s ease';
  slider.value.style.backgroundColor = swipeWouldTrigger ? 'var(--ion-color-success)' : 'var(--ion-color-primary)';
  lastPos = pos;

}
async function endDrag(_event: MouseEvent | TouchEvent) {
  if (null === slider.value || startPos === null || lastPos === null) {
    reset();
    return;
  }
  const movement = lastPos.x - startPos.x;
  const swipeWouldTrigger = Math.abs(movement) > startWidth / 2;
  slider.value.style.transition = 'width 0.25s ease, left 0.25s ease';
  slider.value.style.width = '100%';
  slider.value.style.left = '0px';
  slider.value.style.backgroundColor = 'inherit';
  reset();
  if (swipeWouldTrigger) {
    if (await markDone()) {
      void confetti({
        shapes: ['star'],
        colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
        spread: 360,
        ticks: 50,
        gravity: 1,
        decay: 0.94,
        startVelocity: 15,
        disableForReducedMotion: true,
      });
    }
  }
}

</script>

<style scoped>
.vertical-center {
  vertical-align: middle;
  display: inline-block;
  margin: 2px;
}

.focus-no-highlight:focus-visible {
  outline: none;
}

.flex {
  display: flex;
  flex-direction: column;
}

.w-100 {
  width: 100%;
}

.progress {
  border-radius: 4px;
  height: 40px;
  padding: 4px;
  text-align: center;
  color: var(--ion-text-color, #000);
  margin: 4px 2px 4px 2px;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.danger {
  border: 1px solid var(--ion-color-danger);
}

.small {
  font-size: medium;
}

.flex-start {
  align-self: flex-start;
}

.flex-end {
  align-self: flex-end;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.center {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 2px;
}

.pb-0 {
  padding-bottom: 0;
}

.actions-move,
  /* apply transition to moving elements */
.actions-enter-active,
.actions-leave-active {
  transition: all 0.25s ease;
}

.actions-enter-from,
.actions-leave-to {
  opacity: 0;
  height: 0;
}

.actions-enter-to,
.actions-leave-from {
  height: 44px;
}

.slider {
  position: relative;
  overflow: hidden;
  text-overflow: clip;
}
</style>
