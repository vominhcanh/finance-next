import { BaseType } from './global.type';

export enum WalletType {
    CASH = 'CASH',
    BANK = 'BANK',
    SAVING = 'SAVING',
    CREDIT_CARD = 'CREDIT_CARD',
}

export interface Wallet extends BaseType {
    name: string;
    type: WalletType;
    balance: number;
    currency: string;
    creditLimit?: number;
    statementDate?: number;
    paymentDueDate?: number;
}

export interface WalletData extends Wallet {
    createdAt: string;
    updatedAt: string;
}

export interface WalletForm {
    name: string;
    type: WalletType;
    initialBalance?: number;
    currency?: string;
    creditLimit?: number;
    statementDate?: number;
    paymentDueDate?: number;
}
