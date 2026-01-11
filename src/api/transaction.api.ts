import apiClient from './config/apiClient';
import { API_TRANSACTION } from './config/apiPath';
import { ApiResponse, ApiListResponse } from './config/apiConfig.type';
import { TransactionData, TransactionForm } from '@/types/transaction.type';

export const transactionApi = {
    async getAll(params?: any): Promise<ApiListResponse<TransactionData>> {
        const response = await apiClient.get<ApiResponse<ApiListResponse<TransactionData>>>(API_TRANSACTION.getAll, { params });
        return response.data.data;
    },

    async create(data: TransactionForm): Promise<TransactionData> {
        const response = await apiClient.post<ApiResponse<TransactionData>>(API_TRANSACTION.create, data);
        return response.data.data;
    },

    async update(id: string, data: Partial<TransactionForm>): Promise<TransactionData> {
        // Optimistic update logic is handled by React Query, API just sends data
        const response = await apiClient.patch<ApiResponse<TransactionData>>(API_TRANSACTION.update(id), data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(API_TRANSACTION.delete(id));
    },

    async getOne(id: string): Promise<TransactionData> {
        const response = await apiClient.get<ApiResponse<TransactionData>>(API_TRANSACTION.getOne(id));
        return response.data.data;
    }
};
