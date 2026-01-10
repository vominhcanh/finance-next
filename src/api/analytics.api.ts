import apiClient from './config/apiClient';
import { API_ANALYTICS } from './config/apiPath';
import { ApiResponse } from './config/apiConfig.type';

// Types for responses from API
export interface MonthlyOverviewItem {
    _id: 'INCOME' | 'EXPENSE';
    total: number;
}

export interface DebtStatusItem {
    _id: string;
    totalRemaining: number;
    count: number;
}

// Derived type for UI
export interface MonthlyOverview {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export const analyticsApi = {
    async getMonthlyOverview(): Promise<MonthlyOverview> {
        const response = await apiClient.get<ApiResponse<MonthlyOverviewItem[]>>(API_ANALYTICS.monthlyOverview);
        const data = response.data?.data || [];

        const incomeItem = data.find(item => item._id === 'INCOME');
        const expenseItem = data.find(item => item._id === 'EXPENSE');

        const totalIncome = incomeItem?.total || 0;
        const totalExpense = expenseItem?.total || 0;

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    },

    async getDebtStatus(): Promise<DebtStatusItem[]> {
        const response = await apiClient.get<ApiResponse<DebtStatusItem[]>>(API_ANALYTICS.debtStatus);
        return response.data?.data || [];
    },

    async getCreditCardFees(): Promise<any> {
        const response = await apiClient.get<ApiResponse<any>>(API_ANALYTICS.creditCardFees);
        return response.data?.data;
    }
};
