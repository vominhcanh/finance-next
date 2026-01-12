export type AlertLevel = 'SAFE' | 'WARNING' | 'OVERSPENT' | 'URGENT';

export interface SpendingWarningResponse {
    currentSpending: number;
    monthlyLimit: number;
    percentUsed: number;
    alertLevel: AlertLevel;

    // Advanced Metrics
    projectedSpending: number;
    spendingTrend: number;
    dailyAverage: number;
    safeDailySpend: number;
    topCategory?: {
        name: string;
        amount: number;
        percent: number;
    };
    adviceMessage?: string;
}

export interface UpcomingPaymentItem {
    type: 'CREDIT_CARD' | 'LOAN';
    name: string;
    amount: number;
    dueDate: string;
    daysRemaining: number;
    alertLevel: 'RED' | 'ORANGE' | 'YELLOW';
    walletId?: string; // For CREDIT_CARD
    debtId?: string;   // For LOAN
    installmentId?: string; // For LOAN
    installment?: {
        current: number;
        total: number;
        display: string;
    };
}
