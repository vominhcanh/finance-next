import apiClient from './config/apiClient';
import { API_BANK } from './config/apiPath';
import { Bank } from '@/types/bank.type';

export const bankApi = {
    getAll: async (params?: { keyword?: string }): Promise<Bank[]> => {
        const response = await apiClient.get(API_BANK.getAll, { params });
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        return payload?.data || [];
    },
    sync: async (): Promise<void> => {
        await apiClient.post(API_BANK.sync);
    },
};
