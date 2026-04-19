import { secondsLeft, taskSortByPriority } from '@/common/task-priority';
import { DAY_IN_SECONDS } from '@/common/time';
import { Task } from '@/models/Task';

jest.mock('@/translation');

const NOW_IN_SECONDS = 1000;

jest.useFakeTimers().setSystemTime(NOW_IN_SECONDS * 1000);

describe('task-priority', () => {
    const noDurationUncompleted = createTestTask("noDurationUncompleted", null, null);
    const smallDurationUncompleted = createTestTask("smallDurationUncompleted", 1, null);
    const noDurationJustCompleted = createTestTask("noDurationJustCompleted", null, NOW_IN_SECONDS - 10);
    const doneTask = createTestTask("doneTask", 1, NOW_IN_SECONDS - 5);
    const justDoneTask = createTestTask("justDoneTask", 1, NOW_IN_SECONDS - 1);
    const dueTask = createTestTask("dueTask", 1, NOW_IN_SECONDS - DAY_IN_SECONDS - 20);
    const duerTask = createTestTask("duerTask", 1, NOW_IN_SECONDS - DAY_IN_SECONDS * 2);

    it('secondsSince', () => {
        expect(Date.now()).toBe(1000000);
        expect(secondsLeft(noDurationUncompleted)).toBe(0);
        expect(secondsLeft(smallDurationUncompleted)).toBe(0);
        expect(secondsLeft(noDurationJustCompleted)).toBe(-10);
        expect(secondsLeft(doneTask)).toBe(DAY_IN_SECONDS - 5);
        expect(secondsLeft(justDoneTask)).toBe(DAY_IN_SECONDS - 1);
        expect(secondsLeft(dueTask)).toBe(-20);
        expect(secondsLeft(duerTask)).toBe(-DAY_IN_SECONDS);
    });

    it('sort by priority follows the correct order', () => {
        const unsortedArray = [
            noDurationUncompleted,
            smallDurationUncompleted,
            noDurationJustCompleted,
            doneTask,
            justDoneTask,
            dueTask,
            duerTask,
        ];

        const sortedArray = unsortedArray.concat().sort(taskSortByPriority);

        // Mapped to names only, so the output of jest is more readable
        expect(sortedArray.map(t => t.name)).toStrictEqual([
            "duerTask",
            "dueTask",
            "noDurationUncompleted",
            "smallDurationUncompleted",
            "noDurationJustCompleted",
            "doneTask",
            "justDoneTask",
        ]);
    });
});


function createTestTask(name: string, duration: number|null, lastComplete: number|null): Task {
    return {
        name,
        id: 0,
        icon: 'some-icon',
        assignee: null,
        hue: 0,
        lastComplete,
        duration,
        stars: 0,
        reminder: null,
    };
}
