import apiClient from './config/apiClient';
import { API_AUTH } from './config/apiPath';
import { ApiResponse } from './config/apiConfig.type';
import { LoginForm, LoginResponse, RegisterForm, RegisterResponse, User } from '@/types/auth.type';

export const authApi = {
    async login(data: LoginForm): Promise<LoginResponse> {
        // Backend returns: { status, message, data: { access_token, user } }
        const response = await apiClient.post<ApiResponse<LoginResponse>>(API_AUTH.login, data);
        return response.data.data;
    },

    async register(data: RegisterForm): Promise<RegisterResponse> {
        // Backend returns: { status, message, data: { access_token, user } }
        const response = await apiClient.post<ApiResponse<RegisterResponse>>(API_AUTH.register, data);
        return response.data.data;
    },

    async getProfile(): Promise<User> {
        // Backend returns: { status, message, data: { user } }
        const response = await apiClient.get<ApiResponse<User>>(API_AUTH.profile);
        return response.data.data;
    },
};
