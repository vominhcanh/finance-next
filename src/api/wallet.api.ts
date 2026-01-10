import apiClient from './config/apiClient';
import { API_WALLET } from './config/apiPath';
import { ApiResponse, ApiListResponse } from './config/apiConfig.type';
import { WalletData, WalletForm } from '@/types/wallet.type';

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
};
