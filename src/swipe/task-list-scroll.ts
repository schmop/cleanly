import { ref } from "vue";
import { ScrollCustomEvent } from "@ionic/core";

export type ScrollCallback = (event: ScrollCustomEvent) => void;

const taskViewScrollListeners = new Set<ScrollCallback>();

export const scrollingInTaskListAllowed = ref(true);

export function onTaskViewScroll(event: ScrollCustomEvent) {
    taskViewScrollListeners.forEach((listener) => listener(event));
}