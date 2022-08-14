export type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export type HouseholdId = number;
export type UserId = number;
export type StarsRecord = Record<UserId, number>;