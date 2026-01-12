import { ChangePasswordForm, UpdateProfileForm, UserData } from '@/types/user.type'; // Check import path after creation
import apiClient from './config/apiClient';
import { ApiResponse } from './config/apiConfig.type';
import { API_USER } from './config/apiPath';

export const userApi = {
    async getProfile(): Promise<UserData> {
        const response = await apiClient.get<ApiResponse<UserData>>(API_USER.profile);
        return response.data.data;
    },

    async updateProfile(data: UpdateProfileForm): Promise<UserData> {
        const response = await apiClient.patch<ApiResponse<UserData>>(API_USER.profile, data);
        return response.data.data;
    },

    async changePassword(data: ChangePasswordForm): Promise<void> {
        await apiClient.post<ApiResponse<void>>(API_USER.changePassword, data);
    },

    async updateMonthlyLimit(amount: number): Promise<void> {
        await apiClient.patch<ApiResponse<void>>(API_USER.monthlyLimit, { monthlyLimit: amount });
    }
};
