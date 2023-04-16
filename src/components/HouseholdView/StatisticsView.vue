<template>
  <ion-page>
    <ion-content>
      <ion-loading
        v-if="statistics === null || household === undefined"
        backdrop-dismiss
      />
      <ion-card v-else-if="(sortedTasks ?? []).length === 0">
        <ion-card-header>
          <ion-card-title> {{ _t('There are no tasks yet to analyze') }}</ion-card-title>
        </ion-card-header>
      </ion-card>
      <template v-else>
        <ion-select
          :value="analysis"
          interface="action-sheet"
          :placeholder="_t('Select analysis')"
          @ionChange="selectAnalysis"
        >
          <ion-select-option value="participations">
            {{ _t('Participations') }}
          </ion-select-option>
          <ion-select-option value="punctuality">
            {{ _t('Punctuality') }}
          </ion-select-option>
        </ion-select>
        <ion-select
          :value="selectedTaskId"
          interface="action-sheet"
          :placeholder="_t('Select task')"
          @ionChange="selectTask"
        >
          <ion-select-option
            v-for="task in sortedTasks"
            :key="task.id"
            :value="task.id"
          >
            {{ task.name }}
          </ion-select-option>
        </ion-select>
        <Doughnut
          v-if="analysis === 'participations'"
          :data="participationData"
          :options="options"
        />
        <Bar
          v-else-if="analysis === 'punctuality'"
          :data="punctualityData"
          :options="options"
        />
        <ion-refresher
          slot="fixed"
          @ionRefresh="reloadStatistics"
        >
          <ion-refresher-content />
        </ion-refresher>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { getParticipationData } from "@/components/HouseholdView/statistics/participations";
import { getPunctualityData } from "@/components/HouseholdView/statistics/punctuality";
import { Analysis, BarChartData, DoughnutChartData } from "@/components/HouseholdView/statistics/types";
import { gettersSymbol, stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { HouseholdStats } from '@/models/HouseholdStats';
import { error, showThrownError } from "@/toast";
import { _t } from '@/translation';
import { TaskId } from '@/types';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonLoading,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  onIonViewWillEnter,
  RefresherCustomEvent,
  SelectCustomEvent
} from "@ionic/vue";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';
import { computed, inject, ref } from "vue";
import { Bar, Doughnut } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Colors);

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;

let selectedTaskId = ref<TaskId|null>(null);
let analysis = ref<Analysis>("participations");
let statistics = ref<HouseholdStats|null>(null);
const options = {responsive: true};

const household = computed(() => getters.household.value);
const sortedTasks = computed(() => household.value?.tasks.concat().sort((a, b) => {
  return a.name.localeCompare(b.name);
}));
const selectedTask = computed(() => household.value?.tasks.find((task) => task.id === selectedTaskId.value));
const participationData = computed<DoughnutChartData>(() => getParticipationData(
  selectedTask.value,
  household.value,
  analysis.value,
  statistics.value,
));
const punctualityData = computed<BarChartData>(() => getPunctualityData(
  selectedTask.value,
  analysis.value,
  statistics.value,
));

function selectTask(event: SelectCustomEvent<TaskId>) {
  selectedTaskId.value = event.detail.value;
}

function selectAnalysis(event: SelectCustomEvent<Analysis>) {
  analysis.value = event.detail.value;
}

async function reloadStatistics(event: RefresherCustomEvent) {
  await fetchStatistics();
  event.detail.complete();
}

async function fetchStatistics() {
  const id = state.viewedHousehold;
  if (null === id) {
    await error('Could not fetch logs, no household was selected!');
    return;
  }
  try {
    statistics.value = await taskClient.fetchStatsForHousehold(id);
  } catch (err) {
    await showThrownError(err);
    statistics.value = null;
  }
}

function selectFirstTask() {
  selectedTaskId.value = sortedTasks.value?.[0]?.id ?? null;
}

onIonViewWillEnter(async () => {
  await fetchStatistics();
  selectFirstTask();
});

</script>

<style scoped>
@media (prefers-color-scheme: dark) {
  canvas {
    filter: invert(1) hue-rotate(180deg);
  }
}
</style>
