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
import { mapGetters } from "vuex";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";

export default defineComponent({
    name: "TaskList",
    components: {
        IonContent,
        IonPage,
        TaskView,
    },
    data: () => ({}),
    computed: {
        ...mapGetters(['tasks']),
        sortedTasks() {
            return this.tasks.concat().sort(taskSortByPriority);
        },
    },
});
</script>

<style scoped>
</style>