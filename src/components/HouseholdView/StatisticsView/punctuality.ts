import { HouseholdStats, TaskStats } from "@/models/HouseholdStats";
import { __t, _t } from "@/translation";
import { secondsToHours } from "@/common/time";
import { Analysis } from "@/components/HouseholdView/StatisticsView/types";
import { Task } from "@/models/Task";

export function getPunctualityData(task: Task|undefined, analysis: Analysis, statistics: HouseholdStats|null) {
    const durations: TaskStats = statistics?.durations[task?.id ?? -1]
        ?? {num: 0, average: null, min: null, max: null};
    if ('punctuality' !== analysis
        || undefined === task
        || durations.num === 0
    ) {
        console.warn('Could not show bar chart!', statistics, task?.id)
        return {labels: [], datasets: []};
    }

    return {
        labels: [
            _t("configured"),
            _t("average"),
            _t("minimum"),
            _t("maximum"),
        ],
        datasets: [{
            label: __t('Hours to do {0}', task.name),
            data: [
                task.duration ?? 0,
                secondsToHours(durations.average ?? 0),
                secondsToHours(durations.min ?? 0),
                secondsToHours(durations.max ?? 0),
            ],
        }],
    }
}