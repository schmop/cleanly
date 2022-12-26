<template>
    <ion-page>
        <ion-content>
            <ion-loading backdropDismiss v-if="statistics === null || household === undefined" />
            <template v-else>
                <ion-select :value="analysis" interface="action-sheet" :placeholder="_t('Select analysis')" @ionChange="selectAnalysis">
                    <ion-select-option value="participations">{{ _t('Participations') }}</ion-select-option>
                    <ion-select-option value="punctuality">{{ _t('Punctuality') }}</ion-select-option>
                </ion-select>
                <ion-select :value="selectedTaskId" interface="action-sheet" :placeholder="_t('Select task')" @ionChange="selectTask">
                    <ion-select-option v-for="task in sortedTasks" :key="task.id" :value="task.id">
                        {{ task.name }}
                    </ion-select-option>
                </ion-select>
                <Doughnut v-if="analysis === 'participations'" :data="participationData" :options="options" />
                <Bar v-else-if="analysis === 'punctuality'" :data="punctualityData" :options="options" />
            </template>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { gettersSymbol, stateSymbol, taskClientSymbol } from '@/dependency-injection/injection-keys';
import { HouseholdStats } from '@/models/HouseholdStats';
import { error } from "@/toast";
import { __t, _t } from '@/translation';
import {
    IonContent,
    IonLoading,
    IonPage,
    IonSelect,
    IonSelectOption,
    onIonViewWillEnter,
    SelectCustomEvent
} from "@ionic/vue";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    Colors,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { computed, inject, ref } from "vue";
import { Doughnut, Bar } from 'vue-chartjs';
import { TaskId } from '@/types/index';
import { secondsToDays } from '@/common/time';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Colors);

type DoughnutChartData = ChartData<"doughnut", number[], unknown>;
type BarChartData = ChartData<"bar", number[], unknown>;
type Analysis = "participations" | "punctuality";

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;
const taskClient = inject(taskClientSymbol)!;

let selectedTaskId = ref<TaskId | null>(null);
let analysis = ref<Analysis>("participations");
let statistics = ref<HouseholdStats | null>(null);
const options = { responsive: true };

const household = computed(() => getters.household.value);
const sortedTasks = computed(() => household.value?.tasks.concat().sort((a, b) => {
    return a.name.localeCompare(b.name);
}));
const selectedTask = computed(() => household.value?.tasks.find((task) => task.id === selectedTaskId.value));
const participationData = computed<DoughnutChartData>(() => {
    const task = selectedTask.value;
    if (analysis.value !== 'participations' || null === statistics.value || undefined === task) {
        console.warn('Could not show pie chart!', statistics.value, selectedTaskId.value)
        return { labels: [], datasets: [] };
    }
    const participations = statistics.value.userParticipations[task.id];
    const userIds = household.value?.users.map((user) => user.id) ?? [];
    const participationCounts = userIds.map((userId) => participations[userId] ?? 0);

    return {
        labels: userIdsToUserNames(userIds),
        datasets: [{
            label: __t('Participations at {0}', task.name),
            data: participationCounts,
        }],
    }
});
const punctualityData = computed<BarChartData>(() => {
    const task = selectedTask.value;
    if ('punctuality' !== analysis.value
        || null === statistics.value
        || undefined === task
        || statistics.value.durations[task.id].num === 0
    ) {
        console.warn('Could not show bar chart!', statistics.value, selectedTaskId.value)
        return { labels: [], datasets: [] };
    }
    const durations = statistics.value.durations[task.id];

    return {
        labels: [
            _t("configured"),
            _t("average"),
            _t("minimum"),
            _t("maximum"),
        ],
        datasets: [{
            label: __t('Days to do {0}', task.name),
            data: [
                task.duration ?? 0,
                secondsToDays(durations.average ?? 0),
                secondsToDays(durations.min ?? 0),
                secondsToDays(durations.max ?? 0),
            ],
        }],
    }
});

function userIdsToUserNames(ids: number[]): string[] {
    return ids.map((id) => {
        const user = household.value?.users.find((user) => user.id === id);

        return user?.name ?? `user-${id}`
    });
}

function selectTask(event: SelectCustomEvent<TaskId>) {
    selectedTaskId.value = event.detail.value;
}

function selectAnalysis(event: SelectCustomEvent<Analysis>) {
    analysis.value = event.detail.value;
}

async function fetchStatistics() {
    const id = state.viewedHousehold;
    if (null === id) {
        error('Could not fetch logs, no household was selected!');
        return;
    }
    try {
        statistics.value = await taskClient.fetchStatsForHousehold(id);
    } catch (err) {
        if (err instanceof Error) {
            error(err.message);
        }
        console.error(err);
        statistics.value = null;
    }
}

function selectFirstTask() {
    selectedTaskId.value = sortedTasks.value?.[0].id ?? null;
}

onIonViewWillEnter(() => {
    fetchStatistics();
    selectFirstTask();
});

</script>

<style scoped>

</style>