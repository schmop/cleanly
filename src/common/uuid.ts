import {v4} from 'uuid'; 

export type Uuid = string;

export function uuid4(): Uuid {
    return v4();
}