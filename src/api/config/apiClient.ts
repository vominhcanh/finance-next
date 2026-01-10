import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from './apiPath';
import { ApiErrorResponse } from './apiConfig.type';

// Create axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 and errors
apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Format error response
        const errorData: ApiErrorResponse = {
            status: 'error',
            message: error.response?.data?.message || error.message || 'An error occurred',
            errors: error.response?.data?.errors,
            path: error.response?.data?.path,
            timestamp: error.response?.data?.timestamp,
        };

        return Promise.reject(errorData);
    }
);

export default apiClient;
