<template>
    <ion-page>
        <ion-content>
            <TaskLogView v-for="(log, index) in sortedTaskLogs" :log="log" :key="index" />
            <ion-infinite-scroll @ionInfinite="ionInfinite">
                <ion-infinite-scroll-content></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonContent,
    IonPage,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    onIonViewWillEnter,
} from "@ionic/vue";
import TaskLogView from '../TaskLogView.vue';
import { computed, inject, ref } from "vue";
import { TaskLog } from '../../models/TaskLog';
import { stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { error } from "@/toast";

const state = inject(stateSymbol)!;
const taskClient = inject(taskClientSymbol)!;

let upToFetchId: string | null = null;
let taskLogs = ref([] as TaskLog[]);
let stopScrolling = false;

const sortedTaskLogs = computed(() => {
    const logs = taskLogs.value.concat();
    return logs.sort((a: TaskLog, b: TaskLog) => b.timestamp - a.timestamp);
});

async function fetchLogs() {
    const id = state.viewedHousehold;
    if (null === id) {
        error('Could not fetch logs, no household was selected!');
        return;
    }
    try {
        const response = await taskClient.fetchTaskLog(id, upToFetchId);
        upToFetchId = response.upToId;
        taskLogs.value.push(...response.logs);
    } catch (err) {
        if (err instanceof Error) {
            error(err.message);
        }
        console.error(err);
        stopScrolling = true;
    }
    if (null === upToFetchId) {
        stopScrolling = true;
    }
}

async function ionInfinite(event: IonInfiniteScrollCustomEvent<void>) {
    if (!stopScrolling) {
        await fetchLogs();
    }
    event.target.complete();
}

onIonViewWillEnter(() => {
    upToFetchId = null;
    taskLogs.value = [];
    stopScrolling = false;
    fetchLogs();
});

</script>

<style scoped>

</style>