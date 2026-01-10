import { BaseType } from './global.type';

export enum DebtType {
    LOAN = 'LOAN', // I borrow from someone
    LEND = 'LEND', // I lend to someone
}

export enum DebtStatus {
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
}

export enum InstallmentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
}

export interface Installment extends BaseType {
    debtId?: string; // Optional because in some contexts it might be nested
    dueDate: string;
    amount: number;
    status: InstallmentStatus;
    paidAt?: string;
}

export interface Debt extends BaseType {
    partnerName: string;
    type: DebtType;
    totalAmount: number;
    remainingAmount: number;
    status: DebtStatus;
    isInstallment: boolean;
    startDate?: string;
    paymentDate?: number; // Day of month (e.g., 10)
    totalMonths?: number;
    monthlyPayment?: number;
    paidMonths?: number;
    installments?: Installment[];
}

export interface DebtData extends Debt {
    createdAt: string;
    updatedAt: string;
}

export interface DebtForm {
    partnerName: string;
    type: DebtType;
    totalAmount: number;
    isInstallment: boolean;
    startDate?: string;
    paymentDate?: number;
    totalMonths?: number;
    monthlyPayment?: number;
}

export interface PayInstallmentForm {
    installmentId: string;
    walletId: string;
}
