import { PayStatementPayload, WalletData, WalletForm } from '@/types/wallet.type';
import apiClient from './config/apiClient';
import { ApiListResponse, ApiResponse } from './config/apiConfig.type';
import { API_WALLET } from './config/apiPath';

export const walletApi = {
    async getAll(): Promise<WalletData[]> {
        const response = await apiClient.get<ApiResponse<ApiListResponse<WalletData>>>(API_WALLET.getAll);
        return response.data.data.data;
    },

    async create(data: WalletForm): Promise<WalletData> {
        const response = await apiClient.post<ApiResponse<WalletData>>(API_WALLET.create, data);
        return response.data.data;
    },

    async update(id: string, data: Partial<WalletForm>): Promise<WalletData> {
        const response = await apiClient.patch<ApiResponse<WalletData>>(API_WALLET.update(id), data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(API_WALLET.delete(id));
    },

    async payStatement(id: string, payload: PayStatementPayload): Promise<void> {
        await apiClient.post(API_WALLET.payStatement(id), payload);
    },
};
