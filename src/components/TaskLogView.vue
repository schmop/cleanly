<template>
  <ion-card>
    <ion-card-header>
      <ion-toolbar>
        <ion-card-title>
          <component :is="icon" />
          <ion-text color="secondary">
            <i>{{ userName }}</i>
          </ion-text>
          {{ _t('did') }}
          <ion-text color="secondary">
            <i>{{ task.name }}</i>
          </ion-text>
          {{ relativeInterval }}
          <template v-if="log.stars > 0">
            {{ _t('for') }}
            <ion-text color="warning">
              <i>{{ log.stars }}
                <StarIcon size="18" />
              </i>
            </ion-text>
          </template>
        </ion-card-title>
        <ion-buttons
          v-if="deletable"
          slot="end"
        >
          <ion-button
            color="danger"
            fill="clear"
            @click="$emit('delete')"
          >
            <TrashIcon size="20" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-card-header>
  </ion-card>
</template>

<script setup lang="ts">
import { formatHours, HOUR_IN_SECONDS, secondsSince } from "@/common/time";
import { isValidIcon } from '@/components/icons';
import { TaskLog } from '@/models/TaskLog';
import { __t, _t } from "@/translation";
import { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonText, IonToolbar } from "@ionic/vue";
import { computed } from "vue";
import { StarIcon, TrashIcon } from 'vue-tabler-icons';

const props = defineProps<{
  log: TaskLog,
  deletable?: boolean,
}>();

defineEmits<{
  delete: [],
}>();

const task = computed(() => {
  if (undefined === props.log) {
    throw Error('TaskLog is mandatory in a TaskLogView');
  }
  return props.log.task;
});
const icon = computed(() => isValidIcon(task.value.icon) ? task.value.icon : 'check');
const userName = computed(() => {
  return props.log.user?.name ?? _t('<former member>');
});
const relativeInterval = computed(() => {
  const hoursSinceDone = secondsSince(props.log.timestamp) / HOUR_IN_SECONDS;
  if (hoursSinceDone < 1) {
    return _t('just now');
  }
  return __t('{0} ago', formatHours(hoursSinceDone));
});
</script>

<style scoped>

</style>
