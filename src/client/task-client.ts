import { Task } from '@/models/Task';
import { AuthClient } from './auth-client';

export class TaskClient {
    constructor(private readonly client: AuthClient) {
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

    /**
     * @returns false on error, or the new timestamp of the now completed task
     */
    async markTaskComplete(taskId: string): Promise<boolean|number> {
        const response = await this.client.request(`api/task/mark-done/${taskId}`, {
            method: 'POST',
        });

        if (response.status === 200) {
            return (await response.json()).timestamp as number;
        }

        return false;
    }
}