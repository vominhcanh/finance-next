// Base type for all entities
export interface BaseType {
    _id: string;
}

// Common enums
export enum ResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
