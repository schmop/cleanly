import { Household } from '@/models/Household';
import { Task } from '@/models/Task';
import { TaskLog } from '@/models/TaskLog';
import { isTaskLog } from '@/models/TaskLog.guard';
import { Store } from '@/store';
import { AuthClient } from './auth-client';

export class TaskClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async addNewTask(householdId: number, name: string, icon: string, duration: number, stars: number) {
        const response = await this.client.sendJson(
            'api/task/create',
            {
                household_id: householdId,
                name,
                icon,
                duration,
                stars,
            },
            {method: 'POST'}
        );

        if (response.status !== 200) {
            throw new Error('Could not create task, ' + response.statusText);
        }
    }

    async editTask(task: Task, name: string, icon: string, duration: number, stars: number) {
        const response = await this.client.sendJson(
            `api/task/edit/${task.id}`,
            {
                name,
                icon,
                duration,
                stars,
            },
            {method: 'POST'}
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

    async fetchTaskLog(householdId: number): Promise<void> {
        const household: undefined|Household = this.store.getters.householdById.value(householdId);
        if (null == household) {
            throw new Error('Cannot fetch tasklogs of an unknown household!');
        }
        const response = await this.client.request(`api/task/log/${householdId}`);
        if (response.status !== 200) {
            console.error('Could not fetch task logs', response.statusText);
            throw new Error('Could not fetch task logs, ' + response.statusText);
        }

        const rawLogs = (await response.json()).logs;
        // flatmap allows to map and filter at the same time!
        const logs: TaskLog[] = rawLogs.flatMap((log: any): TaskLog[] => {
            const keysOfData = Object.keys(log);
            const requiredKeys = ['uuid', 'timestamp', 'user', 'task', 'stars'];
            if (!requiredKeys.every((requiredKey: string) => keysOfData.includes(requiredKey))) {
                throw new Error('Invalid task log data given, not all required keys were given!');
            }
            const user = household.users.find((user) => user.id === log.user);
            const task = household.tasks.find((task) => task.id === log.task);
            if (null == task) {
                console.warn(
                    "Tasklog found, that doesn't not belong to a task!",
                    log.task,
                );
                return []; // ignore
            }
            const taskLog = {
                uuid: log.uuid,
                timestamp: log.timestamp,
                user,
                task,
                stars: log.stars,
            };
            if (!isTaskLog(taskLog)) {
                throw new Error('Invalid data generated for task logs!');
            }
            return [taskLog];
        });
        this.store.logs(logs, householdId);
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