<template>
  <ion-card
    class="focus-no-highlight" :class="{ 'danger': overdue }" @click="toggleActions" tabindex="-1"
    @blur.capture="closeActions"
  >
    <ion-card-header v-if="task" class="pb-0">
      <ion-card-title>
        <div>
          <component class="vertical-center" :is="icons[icon]" />
          <span class="vertical-center">{{ task.name }}</span>
        </div>
      </ion-card-title>
    </ion-card-header>
    <ion-card-content class="flex">
      <div class="center">
        <span class="small row">
          {{ durationText }}
        </span>
        <span class="small row" v-if="assignee">
          {{ assignee }}
        </span>
        <div class="flex-end row">
          <ion-text color="warning">
            <span class="vertical-center">{{ task.stars }}</span>
            <StarIcon class="vertical-center" />
          </ion-text>
          <template v-if="canManageTasks && showActions">
            <ion-buttons>
              <ion-button :id="contextMenuId" @click.stop="() => {/** Noop */ }">
                <DotsVerticalIcon slot="icon-only" />
              </ion-button>
            </ion-buttons>
            <ion-popover :trigger="contextMenuId" dismiss-on-select>
              <ion-content>
                <ion-list>
                  <ion-item button @click="editTask" lines="none">
                    <PencilIcon slot="start" />
                    <ion-label> {{ _t('Edit task') }}</ion-label>
                  </ion-item>
                  <ion-item button @click="assignTo" lines="none">
                    <UserCheckIcon slot="start" />
                    <ion-label> {{ _t('Assign to') }}</ion-label>
                  </ion-item>
                  <ion-item button @click="deleteTask" lines="none">
                    <TrashXIcon slot="start" />
                    <ion-label> {{ _t('Delete task') }}</ion-label>
                  </ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </template>
        </div>
      </div>
      <div class="w-100">
        <div class="progress-background soft">
          <div class="progress" :style="taskColor">
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
import toast from "@/toast";
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
    pickerController,
} from "@ionic/vue";
import { computed, inject, ref } from 'vue';
import { DotsVerticalIcon, PencilIcon, StarIcon, TrashXIcon, UserCheckIcon } from 'vue-tabler-icons';

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

let actionsVisible = ref(false);

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
    try {
        await taskClient.deleteTask(props.task.id);
        store.removeTask(props.task.id);
        toast.success(_t('Task deleted successfully'));
    } catch (e) {
        toast.error(_t('Could not delete task'));
    }
}

async function assignTo() {
    const picker = await pickerController.create({
        columns: [
            {
                name: "assignee",
                selectedIndex: countSelectedIndex,
                options: countOptions,
            },
        ],
        buttons: [
            {
                text: _t("Cancel"),
                role: "cancel",
            },
            {
                text: _t("Confirm"),
                handler: ({count, modifier}) => {
                    duration.value = count.value;
                    durationModifier.value = modifier.value;
                },
            },
        ],
    });
    await picker.present();
    await taskClient.assignTo(props.task, assignee)
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
            const householdId = props.household.id;
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
</style>
