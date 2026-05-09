<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Mark done in past') }}
        <CircleXIcon
          style="float: right"
          @click="dismiss()"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <div class="row">
      <ion-select
        v-model="selectedUserId"
        :label="_t('Completed by')"
        label-placement="floating"
        interface="action-sheet"
        fill="outline"
        :compare-with="compareUserIds"
        :disabled="!canManageTasks"
      >
        <ion-select-option
          v-for="member in members"
          :key="member.id"
          :value="member.id"
        >
          {{ member.name }}
        </ion-select-option>
      </ion-select>
    </div>
    <div class="row">
      <ion-label for="past-datetime-button">
        <div class="label-header">
          <CalendarIcon />
          {{ _t('When?') }}
        </div>
        <ion-datetime-button
          id="past-datetime-button"
          datetime="past-datetime"
        />
      </ion-label>
      <ion-modal
        ref="datetimeModal"
        :keep-contents-mounted="true"
      >
        <ion-datetime
          id="past-datetime"
          v-model="selectedDatetime"
          presentation="date-time"
          :max="maxDatetime"
          @ionChange="datetimeModal?.$el.dismiss()"
        />
      </ion-modal>
    </div>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button
        slot="start"
        color="primary"
        @click="confirm()"
      >
        {{ _t('Ok') }}
      </ion-button>
      <ion-button
        slot="end"
        color="light"
        @click="dismiss()"
      >
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { CalendarIcon, CircleXIcon } from 'vue-tabler-icons';
import { _t } from '@/translation';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { ComponentInstance, ref } from 'vue';
import { User } from '@/models/User';

const props = defineProps<{
  members: User[],
  currentUserId: number,
  canManageTasks: boolean,
}>();

const datetimeModal = ref<ComponentInstance<typeof IonModal>>();

const selectedUserId = ref<number>(props.currentUserId);
const selectedDatetime = ref<string>(new Date().toISOString());
const maxDatetime = new Date().toISOString();

async function dismiss() {
  await modalController.dismiss(null, 'cancel');
}

// Numeric ids round-trip through ion-select's action-sheet interface as
// string attributes; without an explicit comparator the picker can drop the
// v-model update and silently leave `selectedUserId` at the initial value.
function compareUserIds(a: unknown, b: unknown): boolean {
  return Number(a) === Number(b);
}

async function confirm() {
  const timestamp = Math.floor(new Date(selectedDatetime.value).getTime() / 1000);
  // Only forward `userId` when the moderator actually changed the picker.
  // Sending the moderator's own id is equivalent to omitting the field
  // (the server credits the logged-in user either way), but omitting it
  // makes "did the user really pick someone else?" observable in the wire
  // payload — which is what the bug report hinged on.
  const userId = selectedUserId.value !== props.currentUserId
    ? selectedUserId.value
    : undefined;
  await modalController.dismiss(
    { timestamp, userId },
    'confirm',
  );
}
</script>

<style scoped>
.row {
  padding: 8px;
  margin-bottom: 8px;
}

.label-header {
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 8px;
}
</style>
