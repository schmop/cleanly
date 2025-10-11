<template>
  <ion-page>
    <ion-content>
      <ion-refresher
        slot="fixed"
        @ionRefresh="reloadStatistics"
      >
        <ion-refresher-content />
      </ion-refresher>
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
        <ion-toolbar class="pt-2">
          <ion-segment
            :value="analysis"
            @ionChange="selectAnalysis"
          >
            <ion-segment-button value="activity">
              <ActivityIcon />
              <ion-label>
                {{ _t('Activity') }}
              </ion-label>
            </ion-segment-button>
            <ion-segment-button value="participations">
              <ChartPieIcon />
              <ion-label>
                {{ _t('Participations') }}
              </ion-label>
            </ion-segment-button>
            <ion-segment-button value="punctuality">
              <ChartInfographicIcon />
              <ion-label>
                {{ _t('Punctuality') }}
              </ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
        <ion-select
          v-if="analysis === 'participations' || analysis === 'punctuality'"
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
        <ActivityView
          v-else
          ref="activityView"
        />
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { getParticipationData } from "@/components/HouseholdView/StatisticsView/participations";
import { getPunctualityData } from "@/components/HouseholdView/StatisticsView/punctuality";
import { Analysis, BarChartData, DoughnutChartData, isAnalysis } from "@/components/HouseholdView/StatisticsView/types";
import { gettersSymbol, stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { HouseholdStats } from '@/models/HouseholdStats';
import { error, showThrownError } from "@/toast";
import { _t } from '@/translation';
import { TaskId } from '@/types';
import ActivityView from "@/components/HouseholdView/StatisticsView/ActivityView.vue";
import { ActivityIcon, ChartInfographicIcon, ChartPieIcon } from 'vue-tabler-icons';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonLabel,
  IonLoading,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  onIonViewWillEnter,
  RefresherCustomEvent,
  SegmentChangeEventDetail,
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
import { computed, inject, ref, useTemplateRef } from "vue";
import { Bar, Doughnut } from 'vue-chartjs';
import { IonSegmentCustomEvent } from "@ionic/core/dist/types/components";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Colors);

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;

const activityView = useTemplateRef<InstanceType<typeof ActivityView>>('activityView');
const selectedTaskId = ref<TaskId|null>(null);
const analysis = ref<Analysis>("activity");
const statistics = ref<HouseholdStats|null>(null);
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

function selectAnalysis(event: IonSegmentCustomEvent<SegmentChangeEventDetail>) {
  if (!isAnalysis(event.detail.value)) {
    return;
  }
  analysis.value = event.detail.value;
}

async function reloadStatistics(event: RefresherCustomEvent) {
  if (activityView.value != null) {
    await activityView.value.reset();
  }
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
.pt-2 {
  padding-top: 8px;
}
</style>
