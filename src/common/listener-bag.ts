import { Callback } from "@/types";

export interface Listener {
    target: EventTarget,
    eventName: string,
    callback: Callback,
}

export class ListenerBag {
    private listeners: Listener[] = [];

    add(target: EventTarget, eventName: string, callback: Callback) {
        this.listeners.push({
            target,
            eventName,
            callback,
        });
        target.addEventListener(eventName, callback);
    }

    clear() {
        this.listeners.forEach(
            ({target, eventName, callback}) => target.removeEventListener(
                eventName,
                callback,
            )
        );
        this.listeners = [];
    }
}
