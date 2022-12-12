export type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export type HouseholdId = number;
export type TaskId = number;
export type UserId = number;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type JsonRecord<_TKey, TValue> = Record<string, TValue>;

export type StarsRecord = Record<UserId, number>;