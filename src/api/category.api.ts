import apiClient from './config/apiClient';
import { API_CATEGORY } from './config/apiPath';
import { ApiResponse, ApiListResponse } from './config/apiConfig.type';
import { CategoryData, CategoryForm } from '@/types/category.type';

export const categoryApi = {
    async getAll(): Promise<CategoryData[]> {
        const response = await apiClient.get<ApiResponse<ApiListResponse<CategoryData>>>(API_CATEGORY.getAll);
        return response.data.data.data;
    },

    async create(data: CategoryForm): Promise<CategoryData> {
        const response = await apiClient.post<ApiResponse<CategoryData>>(API_CATEGORY.create, data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CategoryForm>): Promise<CategoryData> {
        const response = await apiClient.patch<ApiResponse<CategoryData>>(API_CATEGORY.update(id), data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(API_CATEGORY.delete(id));
    },
};
