<template>
  <ion-card>
    <ion-card-header>
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
        {{ _t('for') }}
        <ion-text color="warning">
          <i>{{ log.stars }} <StarIcon size="18" /></i>
        </ion-text>
      </ion-card-title>
    </ion-card-header>
  </ion-card>
</template>

<script setup lang="ts">
import { HOUR_IN_SECONDS, formatHours, secondsSince } from "@/common/time";
import { isValidIcon } from '@/components/icons';
import { TaskLog } from '@/models/TaskLog';
import { __t, _t } from "@/translation";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonText,
} from "@ionic/vue";
import { computed } from "vue";
import { StarIcon } from 'vue-tabler-icons';


const props = defineProps<{
  log: TaskLog,
}>();
const task = computed(() => {
  if (null == props.log) {
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
