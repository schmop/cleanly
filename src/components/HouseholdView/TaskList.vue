<template>
    <ion-page>
        <ion-content>
            <TaskView v-for="(task, index) in sortedTasks" :task="task" :key="index" :show-actions="true" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonContent,
    IonPage,
} from "@ionic/vue";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";
import { store } from "@/store";

export default defineComponent({
    name: "TaskList",
    components: {
        IonContent,
        IonPage,
        TaskView,
    },
    data: () => ({}),
    computed: {
        sortedTasks() {
            return store.getters.tasks.value.concat().sort(taskSortByPriority);
        },
    },
});
</script>

<style scoped>
</style>