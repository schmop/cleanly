export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
export function floor(value: number, precision: number = 0): number {
    const factor = Math.pow(10, precision);
    return Math.floor(value * factor) / factor;
}