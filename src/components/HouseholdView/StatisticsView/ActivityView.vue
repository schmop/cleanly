<template>
  <IonSpinner
    v-if="isLoading"
    class="center"
  />
  <ion-card v-else-if="sortedTaskLogs.length === 0">
    <ion-card-header>
      <ion-card-title> {{ _t('There was no activity yet in this household') }}</ion-card-title>
    </ion-card-header>
  </ion-card>
  <TaskLogView
    v-for="log in sortedTaskLogs"
    :key="log.uuid"
    :log="log"
    :deletable="canDelete(log)"
    @delete="deleteLog(log)"
  />
  <ion-infinite-scroll @ionInfinite="ionInfinite">
    <ion-infinite-scroll-content />
  </ion-infinite-scroll>
</template>

<script setup lang="ts">
import { gettersSymbol, stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { TaskLog } from '@/models/TaskLog';
import { error, showThrownError } from "@/toast";
import { _t } from '@/translation';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner
} from "@ionic/vue";
import { computed, inject, onMounted, ref } from "vue";
import TaskLogView from '@/components/TaskLogView.vue';

const DAY_IN_SECONDS = 86400;

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;

let upToFetchId: string|null = null;
const taskLogs = ref([] as TaskLog[]);
let stopScrolling = false;
const isLoading = ref(true);

const sortedTaskLogs = computed(() => {
  const logs = taskLogs.value.concat();
  return logs.sort((a: TaskLog, b: TaskLog) => b.timestamp - a.timestamp);
});

function canDelete(log: TaskLog): boolean {
  const withinWindow = (Date.now() / 1000 - log.timestamp) < DAY_IN_SECONDS;
  if (!withinWindow) return false;
  const isOwn = log.user?.id === state.user?.id;
  return isOwn || getters.canManageTasks.value();
}

async function deleteLog(log: TaskLog) {
  try {
    await taskClient.deleteTaskLog(log.uuid);
    taskLogs.value = taskLogs.value.filter((l) => l.uuid !== log.uuid);
  } catch (err) {
    void showThrownError(err);
  }
}

async function fetchLogs() {
  const id = state.viewedHousehold;
  if (null === id) {
    void error('Could not fetch logs, no household was selected!');
    isLoading.value = false;
    return;
  }
  try {
    const response = await taskClient.fetchTaskLog(id, upToFetchId);
    upToFetchId = response.upToId;
    taskLogs.value.push(...response.logs);
  } catch (err) {
    void showThrownError(err);
    stopScrolling = true;
  }
  if (null === upToFetchId) {
    stopScrolling = true;
  }
  isLoading.value = false;
}

async function ionInfinite(event: IonInfiniteScrollCustomEvent<void>) {
  if (!stopScrolling) {
    await fetchLogs();
  }
  await event.target.complete();
}

async function reset() {
  upToFetchId = null;
  taskLogs.value = [];
  stopScrolling = false;
  isLoading.value = true;
  await fetchLogs();
}

defineExpose({
  reset,
})

onMounted(async () => {
  await reset();
})

</script>

<style scoped>
.center {
  position: fixed;
  top: 50%;
  left: 50%;
}
</style>
