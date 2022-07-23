<template>
    <ion-page>
        <ion-content>
            <TaskLogView v-for="(log, index) in tasklogs" :log="log" :key="index" />
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonContent,
    IonPage,
    onIonViewWillEnter,
} from "@ionic/vue";
import TaskLogView from '../TaskLogView.vue';
import { container } from '../../container/index';
import { computed, toRefs } from "vue";
import { useStore } from "vuex";
import { TaskLog } from '../../models/TaskLog';

const store = useStore();
const tasklogs = computed(() => {
    const logs = store.getters.taskLogs.concat();

    return logs.sort((a: TaskLog, b: TaskLog) => b.timestamp - a.timestamp);
});
onIonViewWillEnter(() => {
    const id = store.state.viewedHousehold;
    if (null == id) {
        console.error("Could not fetch, no id given");
        return;
    }
    container.getTaskClient().fetchTaskLog(id);
});
</script>

<style scoped>
</style>