import { BaseType } from './global.type';

export enum WalletType {
    CASH = 'CASH',
    BANK = 'BANK',
    DEBIT_CARD = 'DEBIT_CARD',
    CREDIT_CARD = 'CREDIT_CARD',
    PREPAID_CARD = 'PREPAID_CARD',
}

export enum WalletStatus {
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED',
}

export interface Wallet extends BaseType {
    name: string;
    type: WalletType;
    balance: number;
    currency: string;
    status: WalletStatus;

    // Card specific fields
    bankName?: string;
    maskedNumber?: string;
    cardType?: string; // VISA, MASTER, etc.

    // Dates
    issuanceDate?: string | Date;
    expirationDate?: string | Date;

    // Credit Card specific
    creditLimit?: number;
    statementDate?: number; // Day of month (1-31)
    paymentDueDate?: number; // Days after statement or Day of month
    interestRate?: number; // % per year
    annualFee?: number;

    // Bank Integration
    bankId?: string;
    logo?: string;
    color?: string;
}

export interface WalletData extends Wallet {
    createdAt: string;
    updatedAt: string;
    // Populated fields if any
    bank?: {
        logo: string;
        shortName: string;
    }
}

export interface WalletForm {
    name: string;
    type: WalletType;
    initialBalance?: number;
    currency?: string;
    status?: WalletStatus;

    bankName?: string;
    maskedNumber?: string;
    cardType?: string;

    issuanceDate?: string | Date;
    expirationDate?: string | Date;

    creditLimit?: number;
    statementDate?: number;
    paymentDueDate?: number;
    interestRate?: number;
    annualFee?: number;

    // New fields
    bankId?: string;
    color?: string;
    logo?: string;
    initialDebt?: number;
}

export interface PayStatementPayload {
    action: 'PAY_FULL' | 'REFINANCE';
    sourceWalletId: string;
    amount: number;
    refinanceFeeRate?: number;
}
