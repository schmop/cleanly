import { Task } from "@/models/Task";
import { __t } from "@/translation";
import { Analysis } from "@/components/HouseholdView/StatisticsView/types";
import { HouseholdStats } from "@/models/HouseholdStats";
import { Household } from "@/models/Household";

function userIdsToUserNames(ids: number[], household: Household|undefined): string[] {
    return ids.map((id) => {
        const user = household?.users.find((user) => user.id === id);

        return user?.name ?? `user-${id}`
    });
}

export function getParticipationData(task: Task|undefined, household: Household|undefined, analysis: Analysis, statistics: HouseholdStats|null) {
    if (analysis !== 'participations' || null === statistics || undefined === task) {
        console.warn('Could not show pie chart!', statistics);
        return {labels: [], datasets: []};
    }
    const participations = statistics.userParticipations[task.id];
    const userIds = household?.users.map((user) => user.id) ?? [];
    const participationCounts = userIds.map((userId) => participations?.[userId] ?? 0);

    return {
        labels: userIdsToUserNames(userIds, household),
        datasets: [{
            label: __t('Participations at {0}', task.name),
            data: participationCounts,
        }],
    }
}