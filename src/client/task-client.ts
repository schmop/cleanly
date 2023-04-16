import { handleErrorResponse } from "@/client/response/handle-error-response";
import { TaskCompleteResponse } from "@/client/response/TaskCompleteResponse";
import { isTaskCompleteResponse } from "@/client/response/TaskCompleteResponse.guard";
import { Household } from '@/models/Household';
import { HouseholdStats } from '@/models/HouseholdStats';
import { isHouseholdStats } from '@/models/HouseholdStats.guard';
import { Task } from '@/models/Task';
import { TaskLog } from '@/models/TaskLog';
import { isTaskLog } from '@/models/TaskLog.guard';
import { Store } from '@/store';
import { UserId } from "@/types";
import { AuthClient } from './auth-client';
import { RawTaskLog, TaskLogResponse } from './response/TaskLogResponse';
import { isRawTaskLogResponse, isTaskLogResponse } from './response/TaskLogResponse.guard';

export class TaskClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async addNewTask(householdId: number, name: string, icon: string, hue: number|null, duration: number|null, stars: number) {
        const response = await this.client.sendJsonEventually(
            'POST',
            'api/task/create',
            {
                household_id: householdId,
                name,
                icon,
                hue,
                duration,
                stars,
            },
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'creating task');
        }
    }

    async editTask(task: Task, name: string, icon: string, hue: number|null, duration: number|null, stars: number) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/task/edit/${task.id}`,
            {
                name,
                icon,
                hue,
                duration,
                stars,
            },
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'editing task');
        }
    }

    async assignTo(task: Task, assignee: UserId|null) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/task/assign/${task.id}`,
            {
                assignee
            },
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'assigning task');
        }
    }

    async deleteTask(taskId: number) {
        const response = await this.client.requestEventually(
            'DELETE',
            `api/task/${taskId}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'deleting task');
        }
    }

    async fetchTaskLog(householdId: number, fetchFrom: string|null): Promise<TaskLogResponse> {
        const household: undefined|Household = this.store.getters.householdById.value(householdId);
        if (null == household) {
            throw new Error('Cannot fetch tasklogs of an unknown household!');
        }
        const response = await this.client.requestImmediately(
            'GET',
            `api/task/log/${householdId}/${fetchFrom ?? ''}`
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, 'fetching tasklog');
        }

        const data: unknown = await response.json();
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
        const household: undefined|Household = this.store.getters.householdById.value(householdId);
        if (null == household) {
            throw new Error('Cannot fetch task stats of an unknown household!');
        }
        const response = await this.client.requestImmediately(
            'GET',
            `api/task/stats/${householdId}`,
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, 'fetching household stats');
        }

        const data: unknown = await response.json();
        if (!isHouseholdStats(data)) {
            throw new Error('Invalid data received fetching task stats!');
        }

        return data;
    }

    /**
     * @returns new timestamp of the now completed task
     */
    async markTaskComplete(taskId: number): Promise<TaskCompleteResponse> {
        const response = await this.client.requestEventually(
            'POST',
            `api/task/mark-done/${taskId}`
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'marking task as done');
        }
        const data: unknown = await response.json();
        if (!isTaskCompleteResponse(data)) {
            throw new Error('Invalid task complete response given!');
        }

        return data;
    }
}
