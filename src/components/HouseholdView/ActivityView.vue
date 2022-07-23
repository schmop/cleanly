<template>
    <ion-page>
        <ion-content>
            <TaskView v-for="(task, index) in tasks" :task="task" :key="index" :show-actions="true" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { ComponentPublicInstance, defineComponent } from "vue";
import {
    IonContent,
    IonPage,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import TaskView from '../TaskView.vue';
import { taskSortByPriority } from "@/common/task-priority";
import { container } from '../../container/index';

export default defineComponent({
    name: "ActivityView",
    components: {
        IonContent,
        IonPage,
        TaskView,
    },
    data: () => ({
    }),    
    computed: {
        ...mapState(["households"]),
        ...mapState({id: "viewedHousehold"}),
        household(): null | Household {
            return this.households.find((household: Household) => household.id === this.id);
        },
        tasks() {
            return this.household?.tasks.concat().sort(taskSortByPriority);
        },
    },
    mounted() {
        console.log("mount");
    },
    beforeRouteEnter(to, from, next) {
        console.log("route enter");
        next((vm: ComponentPublicInstance) => {
            console.log("NEXT");
            /** @link https://github.com/vuejs/router/issues/701 */
            const activityView = vm as ComponentPublicInstance<{id: number}>;
            if (null == activityView.id) {
                return;
            }
            container.getTaskClient().fetchTaskLog(activityView.id);
        });
    },
    ionViewWillEnter() {
        console.trace();
        console.log("WILLENTER");
    },
    ionViewDidEnter() {
        console.log("DID ENTER");
    },
    beforeRouteUpdate(to, from) {
        console.log("route update");
    },
});
</script>

<style scoped>
</style>