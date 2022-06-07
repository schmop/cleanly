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
          <ion-item-option color="tertiary" @click="markDone">
            {{ _t('Mark done') }}
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
      <template v-if="isAdmin && showActions">
        <ion-buttons slot="end">
          <ion-button :id="contextMenuId" @click.stop>
            <ion-icon slot="icon-only" :icon="ellipsisVertical" />
          </ion-button>
        </ion-buttons>
        <ion-popover :trigger="contextMenuId" dismiss-on-select>
          <ion-content>
            <ion-list>
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

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline, closeCircleOutline, ellipsisVertical, trashOutline } from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
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
  IonButtons,
  IonFooter,
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
import router from "@/router";
import { Task } from "@/models/Task";
import icons from "@/components/icons";
import { colorAsString, green, mix, red } from "@/common/colors";
import { taskProgress } from "@/common/task-priority";
import { DAY_IN_HOURS, DAY_IN_SECONDS, formatHours, HOUR_IN_SECONDS, roundedRecurringInterval, secondsSince } from "@/common/time";
import store from "@/store";
import { _t, translations, __t } from "@/translation";
import { mapState } from "vuex";
import { Household } from "@/models/Household";

export default defineComponent({
  name: "TaskView",
  components: {
    IonCard,
    IonIcon,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItemSliding,
    IonItemOption,
    IonButtons,
    IonButton,
    IonLabel,
    IonList,
    IonContent,
    IonPopover,
    IonItemOptions,
    IonItem,
  },
  props: {
    task: Object as () => Task,
    showActions: Boolean,
  },
  data: () => ({
    addCircleOutline,
    closeCircleOutline,
    ellipsisVertical,
    trashOutline,
    householdName: "",
    icons,
  }),
  computed: {
    ...mapState(['households']),
    contextMenuId() {
      return `task-contextmenu-${this.task?.id}`;
    },
    isAdmin() {
      const household = this.households.find((h: Household) => this.task && h.tasks.includes(this.task));

      return household.admin === client.getMail();
    },
    progress() {
      if (!this.task) {
        return 0;
      }

      return taskProgress(this.task);
    },
    progressStyle() {
      const color = colorAsString(mix(green(), red(), this.progress));

      return `width: ${this.progress * 100}%`;
    },
    overdue() {
      if (!this.task || !this.task.lastComplete) {
        return false;
      }
      const sinceDays = secondsSince(this.task.lastComplete) / DAY_IN_SECONDS;

      return sinceDays >= this.task.duration;
    },
    durationText() {
      if (!this.task) {
        return '';
      }

      return roundedRecurringInterval(this.task.duration);
    },
    dueInText() {
      if (!this.task) {
        return '';
      }

      const { lastComplete, duration } = this.task;

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
    },
  },
  methods: {
    ...translations,
    async deleteTask() {
      if (this.task?.id != null) {
        const newTimestamp = await client.deleteTask(this.task.id);
        store.commit('removeTask', this.task?.id);
      }
    },
    async markDone() {
      if (this.task?.id != null) {
        (this.$refs.slidingButton as any).$el.close();
        const newTimestamp = await client.markTaskComplete(this.task?.id);
        store.commit('markTaskDone', {
          taskId: this.task?.id,
          timestamp: newTimestamp,
        });
      }
    },
  },
});
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