import apiClient from './config/apiClient';
import { API_DEBT } from './config/apiPath';
import { ApiResponse, ApiListResponse } from './config/apiConfig.type';
import { DebtData, DebtForm, PayInstallmentForm } from '@/types/debt.type';

export const debtApi = {
    async getAll(params?: any): Promise<ApiListResponse<DebtData>> {
        const response = await apiClient.get<ApiResponse<ApiListResponse<DebtData>>>(API_DEBT.getAll, { params });
        return response.data.data;
    },

    async getOne(id: string): Promise<DebtData> {
        const response = await apiClient.get<ApiResponse<DebtData>>(API_DEBT.getOne(id));
        return response.data.data;
    },

    async create(data: DebtForm): Promise<DebtData> {
        const response = await apiClient.post<ApiResponse<DebtData>>(API_DEBT.create, data);
        return response.data.data;
    },

    async update(id: string, data: Partial<DebtForm>): Promise<DebtData> {
        const response = await apiClient.patch<ApiResponse<DebtData>>(API_DEBT.update(id), data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(API_DEBT.delete(id));
    },

    async payInstallment(data: PayInstallmentForm): Promise<void> {
        await apiClient.post(API_DEBT.payInstallment, data);
    },
};
