export function entries<K extends string, T>(o: Record<K, T>): ([K, T])[] {
    return Object.entries(o) as ([K, T])[];
}

export function entriesOfPartial<K extends string, T>(o: Partial<Record<K, T>>): ([K, T])[] {
    return Object.entries(o) as ([K, T])[];
}