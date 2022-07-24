import { Household } from '@/models/Household';
import { Task } from '@/models/Task';
import { TaskLog } from '@/models/TaskLog';
import { Store } from '@/store';
import { AuthClient } from './auth-client';

export class TaskClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async addNewTask(householdId: number, taskname: string, icon: string, duration: number) {
        const formData = new FormData();
        formData.append('name', taskname);
        formData.append('household_id', householdId.toString());
        formData.append('icon', icon);
        formData.append('duration', duration.toString());
        const response = await this.client.request('api/task/create', {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async editTask(task: Task, taskname: string, icon: string, duration: number) {
        const formData = new FormData();
        formData.append('name', taskname);
        formData.append('icon', icon);
        formData.append('duration', duration.toString());
        const response = await this.client.request(`api/task/edit/${task.id}`, {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async deleteTask(taskId: string) {
        const response = await this.client.request(`api/task/${taskId}`, {
            method: 'DELETE',
        });

        return response.status === 200;
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
            const requiredKeys = ['uuid', 'timestamp', 'user', 'task'];
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
            return [
                {
                    uuid: log.uuid,
                    timestamp: log.timestamp,
                    user,
                    task

                } as TaskLog
            ];
        });
        this.store.logs(logs, householdId);
    }

    /**
     * @returns false on error, or the new timestamp of the now completed task
     */
    async markTaskComplete(taskId: string): Promise<number> {
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