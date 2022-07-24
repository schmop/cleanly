<template>
    <ion-page>
        <ion-content>
            <TaskView v-for="(task, index) in sortedTasks" :task="task" :key="index" :show-actions="true" />
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import {
    IonContent,
    IonPage,
} from "@ionic/vue";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";
import { gettersSymbol } from "@/dependency-injection/injection-keys";

const getters = inject(gettersSymbol)!;
const sortedTasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
</script>

<style scoped>
</style>