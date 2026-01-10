import { BaseType } from './global.type';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    TRANSFER = 'TRANSFER',
}

export interface Transaction extends BaseType {
    walletId: string;
    categoryId?: string;
    targetWalletId?: string;
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
    images?: string[];
}

export interface TransactionData extends Transaction {
    createdAt: string;
    updatedAt: string;
}

export interface TransactionForm {
    walletId: string;
    categoryId?: string;
    targetWalletId?: string;
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
    images?: string[];
}
