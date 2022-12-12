<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tasks" :href="href('tasks')">
          <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          <ion-label>{{ _t('Tasks') }}</ion-label>
          <ion-badge v-if="numOverdueTasks > 0">{{ numOverdueTasks }}</ion-badge>
        </ion-tab-button>

        <ion-tab-button tab="checklist" :href="href('checklist')">
          <ion-icon :icon="listCircleOutline"></ion-icon>
          <ion-label>{{ _t('Checklist') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="activity" :href="href('activity')">
          <ion-icon :icon="analyticsOutline"></ion-icon>
          <ion-label>{{ _t('Activity') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="statistics" :href="href('statistics')">
          <ion-icon :icon="barChartOutline"></ion-icon>
          <ion-label>{{ _t('Statistics') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="household" :href="href('info')">
          <ion-icon :icon="peopleOutline"></ion-icon>
          <ion-label>{{ _t('Household') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { taskOverDue, taskSortByPriority } from "@/common/task-priority";
import { gettersSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import router from "@/router";
import {
IonBadge, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar,
IonTabButton, IonTabs
} from "@ionic/vue";
import {
analyticsOutline, barChartOutline, checkmarkCircleOutline,
listCircleOutline,
peopleOutline
} from "ionicons/icons";
import { computed, inject, onBeforeUnmount } from "vue";
import { _t } from '../translation';

const store = inject(storeSymbol)!;
const getters = inject(gettersSymbol)!;

const household = computed(() => getters.household.value);
const tasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const numOverdueTasks = computed(() => tasks.value.filter(task => taskOverDue(task)).length);


if (household.value == null) {
  router.push({ name: 'dashboard' });
}
onBeforeUnmount(() => {
  store.viewHousehold(null);
});

function href(path: string) {
  return `/household/${path}`;
}
</script>

<style scoped>
</style>