export type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export type HouseholdId = number;
export type TaskId = number;
export type UserId = number;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type JsonRecord<_TKey, TValue> = Record<string, TValue>;

export type StarsRecord = Record<UserId, number>;

export function keyOf<K extends keyof any, _T>(key: keyof any, dictionary: Record<K, _T>): key is K {
    return key in dictionary;
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Callback = (...args: any[]) => any;
