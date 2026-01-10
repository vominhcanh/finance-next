// API Response Types
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    status: 'error';
    message: string;
    errors?: string[];
    path?: string;
    timestamp?: string;
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ApiListResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
