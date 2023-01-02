<template>
  <ion-card color="light">
    <ion-card-header v-if="household">
      <ion-toolbar color="none">
        <ion-card-title>{{ household.name }}</ion-card-title>
      </ion-toolbar>
    </ion-card-header>
    <ion-card-content>
      <TaskView
        v-for="(task, index) in tasks" :task="task" :household="props.household" :key="index"
        :show-actions="false"
      />
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { taskSortByPriority } from "@/common/task-priority";
import TaskView from "@/components/TaskView.vue";
import { Household } from "@/models/Household";
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToolbar } from "@ionic/vue";
import { computed } from 'vue';

const props = defineProps<{
    household: Household
}>();
const tasks = computed(() => props.household.tasks.concat().sort(taskSortByPriority).slice(0, 2));
</script>

<style scoped>

</style>
