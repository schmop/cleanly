<template>
  <ion-card class="focus-no-highlight" :class="{ 'danger': overdue }" @click="toggleActions" tabindex="-1"
    @blur.capture="closeActions">
    <ion-card-header v-if="task">
      <ion-card-title>
        <div>
          <ion-icon :icon="icons[task.icon]" />
          {{ task.name }}
        </div>
        <div class="center">
          <span class="small row">
            {{ durationText }}
          </span>
          <div class="flex-end row">
            <ion-text color="warning">
              {{ task.stars }}
              <ion-icon :icon="starOutline" />
            </ion-text>
            <template v-if="isAdmin && showActions">
              <ion-buttons>
                <ion-button :id="contextMenuId" @click.stop="() => {/** Noop */ }">
                  <ion-icon slot="icon-only" :icon="ellipsisVertical" />
                </ion-button>
              </ion-buttons>
              <ion-popover :trigger="contextMenuId" dismiss-on-select>
                <ion-content>
                  <ion-list>
                    <ion-item button @click="editTask" lines="none">
                      <ion-icon slot="start" :icon="pencilOutline" />
                      <ion-label> {{ _t('Edit task') }} </ion-label>
                    </ion-item>
                    <ion-item button @click="deleteTask" lines="none">
                      <ion-icon slot="start" :icon="trashOutline" />
                      <ion-label> {{ _t('Delete task') }} </ion-label>
                    </ion-item>
                  </ion-list>
                </ion-content>
              </ion-popover>
            </template>
          </div>
        </div>
      </ion-card-title>
    </ion-card-header>
    <ion-card-content class="flex">
      <div class="w-100">
        <div class="progress-background soft">
          <div class="progress" :style="progressStyle">
            {{ dueInText }}
          </div>
        </div>
      </div>
      <transition name="actions">
        <div class="w-100" v-show="actionsVisible">
          <ion-button expand="block" color="tertiary" @click.stop="markDone">
            {{ _t('Mark done') }}
          </ion-button>
        </div>
      </transition>

    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, inject, computed, Ref } from 'vue';
import { ellipsisVertical, trashOutline, pencilOutline, starOutline } from "ionicons/icons";
import {
  IonLabel,
  IonItem,
  IonContent,
  IonText,
  IonIcon,
  IonButton,
  IonButtons,
  IonList,
  IonItemSliding,
  IonPopover,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  modalController,
} from "@ionic/vue";
import { Task } from "@/models/Task";
import TaskForm from "@/modals/TaskForm.vue";
import icons from "@/components/icons";
import { taskOverDue, taskProgress } from "@/common/task-priority";
import { DAY_IN_HOURS, formatHours, HOUR_IN_SECONDS, roundedRecurringInterval, secondsSince } from "@/common/time";
import { _t, __t } from "@/translation";
import { Household } from "@/models/Household";
import toast from "@/toast";
import { householdClientSymbol, stateSymbol, storeSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';

const props = defineProps<{
  task: Task,
  showActions: boolean,
}>();
const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const taskClient = inject(taskClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;

let actionsVisible = ref(false);

const household = computed(() => state.households.find((h: Household) => h.tasks.includes(props.task)));
const contextMenuId = computed(() => `task-contextmenu-${props.task.id}`);
const isAdmin = computed(() => household.value?.admin === state.user?.id);
const progress = computed(() => taskProgress(props.task));
const progressStyle = computed(() => `width: ${progress.value * 100}%`);
const overdue = computed(() => taskOverDue(props.task));
const durationText = computed(() => roundedRecurringInterval(props.task.duration));
const dueInText = computed(() => {
  const { lastComplete, duration } = props.task;

  if (null == lastComplete) {
    return _t('Never done before');
  }
  const lastCompleteHours = secondsSince(lastComplete) / HOUR_IN_SECONDS;
  const durationHours = duration * DAY_IN_HOURS;
  const hoursLeft = durationHours - lastCompleteHours;
  if (hoursLeft < 0) {
    return __t('Overdue for {0}', formatHours(-hoursLeft));
  }

  return __t('{0} left', formatHours(hoursLeft));
});

async function deleteTask() {
  if (props.task.id != null) {
    try {
      await taskClient.deleteTask(props.task.id);
      store.removeTask(props.task.id);
      toast.success(_t('Task deleted successfully'));
    } catch (e) {
      toast.error(_t('Could not delete task'));
    }
  }
}
async function editTask() {
  const taskFormModal = await modalController.create({
    component: TaskForm,
    componentProps: {
      task: props.task,
    },
  });
  taskFormModal.present();
  await taskFormModal.onDidDismiss();
  await householdClient.dashboardInfo();
}
async function markDone() {
  if (props.task.id != null) {
    try {
      actionsVisible.value = false;
      const newTimestamp = await taskClient.markTaskComplete(props.task.id);
      store.markTaskDone(props.task.id, newTimestamp);
      toast.success(_t('Task done'));
      const householdId = household.value?.id;
      if (null != householdId) {
        householdClient.retrieveStars(householdId);
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  }
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
  if (target instanceof HTMLElement && card.contains(target as HTMLElement)) {
    return;
  }

  actionsVisible.value = false;
}

</script>

<style scoped>
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
  color: var(--ion-color-danger-contrast);
  background-color: rgb(35, 133, 35);
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.soft>.progress {
  background-color: rgb(48, 129, 223);
}

.progress-background {
  border-radius: 4px;
  margin: 4px 2px 4px 2px;
  background-color: rgb(100, 21, 21);
}

.progress-background.soft {
  background-color: rgb(32, 59, 177);
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
</style>