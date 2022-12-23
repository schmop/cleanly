import { Household } from '@/models/Household';
import { HouseholdStats } from '@/models/HouseholdStats';
import { isHouseholdStats } from '@/models/HouseholdStats.guard';
import { Task } from '@/models/Task';
import { TaskLog } from '@/models/TaskLog';
import { isTaskLog } from '@/models/TaskLog.guard';
import { Store } from '@/store';
import { AuthClient } from './auth-client';
import { RawTaskLog, TaskLogResponse } from './response/TaskLogResponse';
import { isRawTaskLogResponse, isTaskLogResponse } from './response/TaskLogResponse.guard';

export class TaskClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async addNewTask(householdId: number, name: string, icon: string, hue: number|null, duration: number|null, stars: number) {
        const response = await this.client.sendJson(
            'api/task/create',
            {
                household_id: householdId,
                name,
                icon,
                hue,
                duration,
                stars,
            },
            { method: 'POST' }
        );

        if (response.status !== 200) {
            throw new Error('Could not create task, ' + response.statusText);
        }
    }

    async editTask(task: Task, name: string, icon: string, hue: number|null, duration: number|null, stars: number) {
        const response = await this.client.sendJson(
            `api/task/edit/${task.id}`,
            {
                name,
                icon,
                hue,
                duration,
                stars,
            },
            { method: 'POST' }
        );

        if (response.status !== 200) {
            throw new Error('Could not edit task, ' + response.statusText);
        }
    }

    async deleteTask(taskId: number) {
        const response = await this.client.request(`api/task/${taskId}`, {
            method: 'DELETE',
        });

        if (response.status !== 200) {
            throw new Error('Could not delete task, ' + response.statusText);
        }
    }

    async fetchTaskLog(householdId: number, fetchFrom: string | null): Promise<TaskLogResponse> {
        const household: undefined | Household = this.store.getters.householdById.value(householdId);
        if (null == household) {
            throw new Error('Cannot fetch tasklogs of an unknown household!');
        }
        const response = await this.client.request(`api/task/log/${householdId}/${fetchFrom ?? ''}`);
        if (response.status !== 200) {
            console.error('Could not fetch task logs', response.statusText);
            throw new Error('Could not fetch task logs, ' + response.statusText);
        }

        const data = await response.json();
        if (!isRawTaskLogResponse(data)) {
            throw new Error('Invalid data received fetching task logs!');
        }

        const hydratedLogs = data.logs
            .map((log: RawTaskLog) => ({
                uuid: log.uuid,
                timestamp: log.timestamp,
                user: household.users.find((user) => user.id === log.user),
                task: household.tasks.find((task) => task.id === log.task),
                stars: log.stars,
            }))
            .filter((hydratedLog: any): hydratedLog is TaskLog => isTaskLog(hydratedLog));

        const taskLogResponse = {
            logs: hydratedLogs,
            upToId: data.upToId,
        };

        if (!isTaskLogResponse(taskLogResponse)) {
            throw new Error('Invalid data given when fetching task logs!');
        }

        return taskLogResponse;
    }

    async fetchStatsForHousehold(householdId: number): Promise<HouseholdStats> {
        const household: undefined | Household = this.store.getters.householdById.value(householdId);
        if (null == household) {
            throw new Error('Cannot fetch task stats of an unknown household!');
        }
        const response = await this.client.request(`api/task/stats/${householdId}`);
        if (response.status !== 200) {
            console.error('Could not fetch task stats', response.statusText);
            throw new Error('Could not fetch task stats, ' + response.statusText);
        }

        const data = await response.json();
        if (!isHouseholdStats(data)) {
            throw new Error('Invalid data received fetching task stats!');
        }

        return data;
    }

    /**
     * @returns false on error, or the new timestamp of the now completed task
     */
    async markTaskComplete(taskId: number): Promise<number> {
        const response = await this.client.request(`api/task/mark-done/${taskId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not mark task as done', response.statusText);
            throw new Error('Could not mark task as done, ' + response.statusText);
        }

        return (await response.json()).timestamp as number;
    }
}