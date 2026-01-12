// Base API URL
// @ts-ignore
export const BASE_URL = import.meta.env.VITE_API_URL;
export const V1 = '/v1';

// Auth API Paths
export const API_AUTH = {
    login: '/auth/login',
    register: '/auth/register',
    profile: `${V1}/users/me`, // Updated to match user spec
};

// User API Paths
export const API_USER = {
    profile: `${V1}/users/me`,
    changePassword: `${V1}/users/change-password`,
};

// Category API Paths
export const API_CATEGORY = {
    getAll: `${V1}/categories`,
    create: `${V1}/categories`,
    getOne: (id: string) => `${V1}/categories/${id}`,
    update: (id: string) => `${V1}/categories/${id}`,
    delete: (id: string) => `${V1}/categories/${id}`,
};

// Wallet API Paths
export const API_WALLET = {
    getAll: `${V1}/wallets`,
    create: `${V1}/wallets`,
    getOne: (id: string) => `${V1}/wallets/${id}`,
    update: (id: string) => `${V1}/wallets/${id}`,
    delete: (id: string) => `${V1}/wallets/${id}`,
};

// Transaction API Paths
export const API_TRANSACTION = {
    getAll: `${V1}/transactions`,
    create: `${V1}/transactions`,
    getOne: (id: string) => `${V1}/transactions/${id}`,
    update: (id: string) => `${V1}/transactions/${id}`,
    delete: (id: string) => `${V1}/transactions/${id}`,
};

// Debt API Paths
export const API_DEBT = {
    getAll: `${V1}/debts`,
    create: `${V1}/debts`,
    getOne: (id: string) => `${V1}/debts/${id}`,
    update: (id: string) => `${V1}/debts/${id}`,
    delete: (id: string) => `${V1}/debts/${id}`,
    payInstallment: `${V1}/debts/pay-installment`,
};

// Analytics API Paths
export const API_ANALYTICS = {
    monthlyOverview: `${V1}/analytics/monthly-overview`,
    debtStatus: `${V1}/analytics/debt-status`,
    creditCardFees: `${V1}/analytics/credit-card-fees`,
    cardsSummary: `${V1}/transactions/stats/cards/summary`,
    categorySpending: (id: string) => `${V1}/transactions/stats/wallet/${id}/overview`,
    transactionsMonthly: `${V1}/analytics/transactions-monthly`,
};

// Bank API Paths
export const API_BANK = {
    getAll: `${V1}/banks`,
    sync: `${V1}/banks/sync`,
};
