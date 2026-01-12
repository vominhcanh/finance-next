import { SpendingWarningResponse, UpcomingPaymentItem } from '@/types/analytics.type';
import apiClient from './config/apiClient';
import { ApiResponse } from './config/apiConfig.type';
import { API_ANALYTICS } from './config/apiPath';

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

export interface WalletOverviewStats {
    _id: string | null;
    totalTransactions: number;
    totalIncome: number;
    totalExpense: number;
}

export interface MonthlyTransactionItem {
    day: number;
    date: string;
    income: number;
    expense: number;
}

// Derived type for UI
export interface MonthlyOverview {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export interface CardSummaryItem {
    _id: string; // Wallet ID
    walletName: string;
    walletType: string;
    totalTransactions: number;
    totalIncome: number;
    totalExpense: number;
}

export interface CategorySpendingItem {
    categoryName: string;
    totalAmount: number;
}

// Chart Response Types
export interface TrendAnalysisItem {
    month: string;
    income: number;
    expense: number;
}

export interface CategoryBreakdownItem {
    categoryName: string;
    totalAmount: number;
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
    },

    async getCardsSummary(): Promise<CardSummaryItem[]> {
        const response = await apiClient.get<ApiResponse<CardSummaryItem[]>>(API_ANALYTICS.cardsSummary);
        return response.data?.data || [];
    },

    async getCategorySpending(walletId: string): Promise<WalletOverviewStats> {
        const response = await apiClient.get<ApiResponse<WalletOverviewStats>>(API_ANALYTICS.categorySpending(walletId));
        // Handle case where data might be null or empty
        return response.data?.data || { _id: null, totalTransactions: 0, totalIncome: 0, totalExpense: 0 };
    },

    async getMonthlyTransactions(month?: string, walletId?: string): Promise<MonthlyTransactionItem[]> {
        const params: any = {};
        if (month) params.month = month;
        if (walletId) params.walletId = walletId;

        const response = await apiClient.get<ApiResponse<MonthlyTransactionItem[]>>(API_ANALYTICS.transactionsMonthly, { params });
        return response.data?.data || [];
    },

    async getSpendingWarning(): Promise<SpendingWarningResponse> {
        const response = await apiClient.get<ApiResponse<SpendingWarningResponse>>(API_ANALYTICS.spendingWarning);
        return response.data?.data;
    },

    async getUpcomingPayments(): Promise<UpcomingPaymentItem[]> {
        const response = await apiClient.get<ApiResponse<UpcomingPaymentItem[]>>(API_ANALYTICS.upcomingPayments);
        return response.data?.data || [];
    },

    // Chart APIs
    async getTrendAnalysis(period: '6m' | '12m' = '6m'): Promise<TrendAnalysisItem[]> {
        const response = await apiClient.get<ApiResponse<TrendAnalysisItem[]>>(API_ANALYTICS.trendAnalysis, {
            params: { period }
        });
        return response.data?.data || [];
    },

    async getCategoryBreakdown(month?: string): Promise<CategoryBreakdownItem[]> {
        const params: any = {};
        if (month) params.month = month;

        const response = await apiClient.get<ApiResponse<CategoryBreakdownItem[]>>(API_ANALYTICS.categoryBreakdown, { params });
        return response.data?.data || [];
    }
};
