export type AlertLevel = 'SAFE' | 'WARNING' | 'OVERSPENT' | 'URGENT';

export interface SpendingWarningResponse {
    currentSpending: number;
    monthlyLimit: number;
    percentUsed: number;
    alertLevel: AlertLevel;
}

export interface UpcomingPaymentItem {
    type: 'CREDIT_CARD' | 'LOAN';
    name: string;
    amount: number;
    dueDate: string;
    daysRemaining: number;
    alertLevel: AlertLevel;
    installment?: {
        current: number;
        total: number;
        display: string;
    };
}
