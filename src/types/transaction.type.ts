import { BaseType } from './global.type';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    TRANSFER = 'TRANSFER',
}

export interface Transaction extends BaseType {
    walletId: string;
    categoryId: string; // Required per spec
    targetWalletId?: string; // Optional (Transfer only)
    amount: number;
    type: TransactionType;
    date: string; // ISO Date string
    note?: string;
    images?: string[];
}

export interface TransactionData extends Transaction {
    createdAt?: string; // API might return these
    updatedAt?: string;
    // Expanded fields for UI if backend joins them
    categoryName?: string;
    categoryIcon?: string;
    walletName?: string;
}

export interface TransactionForm {
    walletId: string;
    categoryId: string;
    targetWalletId?: string;
    amount: number;
    type: TransactionType;
    date: string; // ISO string
    note?: string;
    images?: string[];
}

export interface TransactionQueryParams {
    page?: number;
    take?: number;
    startDate?: string;
    endDate?: string;
    walletId?: string;
    categoryId?: string;
}
