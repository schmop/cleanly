export type Position = {x: number, y: number};

/**
 * Extracts the position from a mouse or touch event.
 */
export function positionFromEvent(event: MouseEvent | TouchEvent): Position {
    if (event instanceof MouseEvent) {
        return {x: event.clientX, y: event.clientY};
    }
    return {x: event.touches[0]!.clientX, y: event.touches[0]!.clientY};
}