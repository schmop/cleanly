<template>
    <ion-page>
        <ion-content>
            <TaskView v-for="(task, index) in tasks" :task="task" :key="index" :show-actions="true" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonContent,
    IonPage,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";

export default defineComponent({
    name: "TaskList",
    components: {
        IonContent,
        IonPage,
        TaskView,
    },
    data: () => ({
    }),
    props: {
        id: Number,
    },
    computed: {
        ...mapState(["households"]),
        household(): null | Household {
            return this.households.find((household: Household) => household.id === this.id);
        },
        tasks() {
            return this.household?.tasks.concat().sort(taskSortByPriority);
        },
    },
});
</script>

<style scoped>
</style>