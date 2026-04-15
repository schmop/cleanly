import { scrollingInTaskListAllowed } from "@/swipe/task-list-scroll";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { clamp } from "@/common/math";
import { Callback } from "@/types";
import { ListenerBag } from "@/common/listener-bag";
import { Position, positionFromEvent } from "@/common/input";


function createSwipeState(node: HTMLElement, triggerCallback: Callback) {
    let startPos: Position|null = null;
    let lastPos: Position|null = null;
    let startRect: DOMRect|null = null;
    let swipeStarted: boolean = false;
    let scrollDetected: boolean = false;

    function setSwipeStarted(value: boolean) {
        swipeStarted = value;
        scrollingInTaskListAllowed.value = !value;
    }
    function reset() {
        startPos = null;
        lastPos = null;
        startRect = null;
        setSwipeStarted(false);
        scrollDetected = false;
        if (node !== null) {
            node.style.transition = 'width 0.25s ease, left 0.25s ease';
            node.style.backgroundColor = 'inherit';
            node.style.width = '100%';
            node.style.left = '0px';
        }
    }
    function startDrag(event: MouseEvent | TouchEvent) {
        startRect = node.getBoundingClientRect();
        // Prevent the hamburger menu from opening
        event.stopPropagation();
        scrollDetected = false;
        node.style.transition = 'width 0 ease, left 0 ease';
        lastPos = startPos = positionFromEvent(event);
    }
    function detectScroll() {
        if (startRect === null || swipeStarted || scrollDetected) {
            return;
        }
        if (Math.abs(node.getBoundingClientRect().y - startRect.y) >= 30) {
            scrollDetected = true;
        }
    }
    function detectSwiping(event: MouseEvent | TouchEvent) {
        if (startPos === null || lastPos === null || scrollDetected || swipeStarted) {
            return;
        }
        const pos = positionFromEvent(event);
        const movement = pos.x - startPos.x;
        if (Math.abs(movement) < 30) {
            return;
        }
        setSwipeStarted(true);
        startPos = pos;
        lastPos = pos;
    }
    function drag(event: MouseEvent | TouchEvent) {
        if (startRect === null || startPos === null || lastPos === null) {
            reset();
            return;
        }
        detectScroll();
        if (scrollDetected) {
            reset();
            return;
        }
        detectSwiping(event);
        if (!swipeStarted) {
            return;
        }
        // Prevent the hamburger menu from opening
        event.stopPropagation();
        const pos = positionFromEvent(event);
        const movement = pos.x - startPos.x;
        const lastMovement = lastPos.x - startPos.x;
        const swipeWouldTrigger = Math.abs(movement) > startRect.width / 2;
        const swipeWasTriggering = Math.abs(lastMovement) > startRect.width / 2;
        if (swipeWouldTrigger !== swipeWasTriggering) {
            void Haptics.impact({
                style: ImpactStyle.Light
            });
        }
        const width = clamp((startRect.width - Math.abs(movement)) / startRect.width * 100, 0, 100);
        node.style.width = `${width}%`;
        node.style.left = `${clamp(movement, 0, startRect?.width)}px`;
        node.style.transition = 'width 0s ease, left 0s ease';
        node.style.backgroundColor = swipeWouldTrigger ? 'var(--ion-color-success)' : 'var(--ion-color-primary)';
        lastPos = pos;

    }
    function endDrag(event: MouseEvent | TouchEvent) {
        if (startRect === null || startPos === null || lastPos === null || scrollDetected) {
            reset();
            return;
        }
        // Prevent the hamburger menu from opening
        event.stopPropagation();
        const movement = lastPos.x - startPos.x;
        const swipeWouldTrigger = Math.abs(movement) > startRect.width / 2;
        reset();
        if (swipeWouldTrigger) {
            void Haptics.impact({
                style: ImpactStyle.Heavy
            });
            triggerCallback();
        }
    }

    return {
        startDrag,
        drag,
        endDrag
    };
}
export function registerTaskSwipe(node: HTMLElement, triggerCallback: Callback): () => void {
    const bag = new ListenerBag();
    const state = createSwipeState(node, triggerCallback);
    bag.add(node, 'mousedown', state.startDrag);
    bag.add(node, 'mousemove', state.drag);
    bag.add(node, 'mouseup', state.endDrag);
    bag.add(node, 'touchstart', state.startDrag);
    bag.add(node, 'touchmove', state.drag);
    bag.add(node, 'touchcancel', state.endDrag);
    bag.add(node, 'touchend', state.endDrag);
    return () => bag.clear();
}