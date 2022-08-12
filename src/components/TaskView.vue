<template>
  <ion-card :class="{ 'danger': overdue }">
    <ion-card-header v-if="task">
      <ion-card-title>
        <ion-icon :icon="icons[task.icon]" />
        {{ task.name }}
        <span class="small pull-right">
          {{ durationText }}
        </span>
      </ion-card-title>
    </ion-card-header>
    <ion-card-content class="flex">
      <ion-item-sliding ref="slidingButton">
        <ion-item lines="none">
          <div class="progress-background soft">
            <div class="progress" :style="progressStyle">
              {{ dueInText }}
            </div>
          </div>
        </ion-item>
        <ion-item-options side="start">
          <ion-item-option color="tertiary" @click.stop="markDone">
            {{ _t('Mark done') }}
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
      <template v-if="isAdmin && showActions">
        <ion-buttons slot="end">
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
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, inject, computed, Ref } from 'vue';
import { ellipsisVertical, trashOutline, pencilOutline } from "ionicons/icons";
import {
  IonLabel,
  IonItem,
  IonContent,
  IonIcon,
  IonButton,
  IonButtons,
  IonList,
  IonItemSliding,
  IonPopover,
  IonItemOption,
  IonItemOptions,
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

const households = computed(() => state.households);
const contextMenuId = computed(() => `task-contextmenu-${props.task.id}`);
const isAdmin = computed(() => households.value.find((h: Household) => h.tasks.includes(props.task)));
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

const slidingButton: Ref<typeof IonItemSliding|null> = ref(null);

async function deleteTask() {
  if (props.task.id != null) {
    await taskClient.deleteTask(props.task.id);
    store.removeTask(props.task.id);
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
    if (null == slidingButton.value) {
      console.error('Could not close sliding button, the button vanished!');
      toast.error('Could not close sliding button, the button vanished!');
      return;
    }
    slidingButton.value.$el.close();
    try {
      const newTimestamp = await taskClient.markTaskComplete(props.task.id);
      store.markTaskDone(props.task.id, newTimestamp);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }

  }
}
</script>

<style scoped>
.flex {
  display: flex;
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
  background-color: rgb(100, 21, 21);
  width: 100%;
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

.pull-right {
  float: right;
}
</style>