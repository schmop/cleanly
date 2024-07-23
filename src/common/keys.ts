export function keys<K extends string>(o: Record<K, unknown>): K[] {
    return Object.keys(o) as K[];
}