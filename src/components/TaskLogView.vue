<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="icons[task.icon]" />
        <ion-text color="secondary">
          <i>{{ userName }}</i>
        </ion-text>
        {{ _t('did') }}
        <ion-text color="secondary">
          <i>{{ task.name }}</i>
        </ion-text>
        {{ relativeInterval }}
        {{_t('for')}}
        <ion-text color="warning">
          <i>{{task.stars}} <ion-icon :icon="starOutline"/></i>
        </ion-text>
      </ion-card-title>
    </ion-card-header>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  IonText,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/vue";
import icons from "@/components/icons";
import { _t, __t } from "@/translation";
import { TaskLog } from '../models/TaskLog';
import { formatHours, secondsSince } from "@/common/time";
import { HOUR_IN_SECONDS } from '../common/time';
import { starOutline } from "ionicons/icons";


const props = defineProps<{
  log: TaskLog,
}>();
const task = computed(() => {
  if (null == props.log) {
    throw Error('TaskLog is mandatory in a TaskLogView');
  }
  return props.log.task;
});
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