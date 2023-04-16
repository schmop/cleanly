<template>
  <ion-page>
    <ion-content>
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
        v-for="(log, index) in sortedTaskLogs"
        :key="index"
        :log="log"
      />
      <ion-infinite-scroll @ionInfinite="ionInfinite">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
      <ion-refresher
        slot="fixed"
        @ionRefresh="reload"
      >
        <ion-refresher-content />
      </ion-refresher>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { TaskLog } from '@/models/TaskLog';
import { error, showThrownError } from "@/toast";
import { _t } from '@/translation';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  onIonViewWillEnter,
  RefresherCustomEvent
} from "@ionic/vue";
import { computed, inject, ref } from "vue";
import TaskLogView from '../TaskLogView.vue';

const state = inject(stateSymbol)!;
const taskClient = inject(taskClientSymbol)!;

let upToFetchId: string|null = null;
let taskLogs = ref([] as TaskLog[]);
let stopScrolling = false;
let isLoading = ref(true);

const sortedTaskLogs = computed(() => {
  const logs = taskLogs.value.concat();
  return logs.sort((a: TaskLog, b: TaskLog) => b.timestamp - a.timestamp);
});

async function reload(event: RefresherCustomEvent) {
  await reset();
  event.detail.complete();
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

onIonViewWillEnter(async () => {
  await reset();
});

</script>

<style scoped>
.center {
  position: fixed;
  top: 50%;
  left: 50%;
}
</style>
