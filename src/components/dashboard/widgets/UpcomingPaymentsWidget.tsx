import { analyticsApi } from '@/api/analytics.api';
import { PayInstallmentModal } from '@/components/debts/PayInstallmentModal';
import { PayStatementModal } from '@/components/wallets/PayStatementModal';
import { useQueryWallets } from '@/queryHooks/wallet';
import { UpcomingPaymentItem } from '@/types/analytics.type';
import { WalletData } from '@/types/wallet.type';
import { ClockCircleOutlined, CreditCardOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Button, Card, List, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import './Widgets.scss';

export const UpcomingPaymentsWidget = () => {
    // Queries
    const { data: payments, isLoading, refetch } = useQuery({
        queryKey: ['upcomingPayments'],
        queryFn: analyticsApi.getUpcomingPayments,
    });

    const { data: wallets } = useQueryWallets();

    // State for Modals
    const [statementModal, setStatementModal] = useState<{ open: boolean; wallet: WalletData | null }>({
        open: false,
        wallet: null
    });

    const [installmentModal, setInstallmentModal] = useState<{ open: boolean; data: any | null }>({
        open: false,
        data: null
    });

    // Validations / Calculations
    const totalAmount = payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const criticalCount = payments?.filter(item => item.alertLevel === 'RED').length || 0;

    // Handlers
    const handlePayCreditCard = (item: UpcomingPaymentItem) => {
        if (!item.walletId || !wallets) return;
        const wallet = wallets.find((w: any) => w._id === item.walletId);
        if (wallet) {
            setStatementModal({ open: true, wallet });
        }
    };

    const handlePayLoan = (item: UpcomingPaymentItem) => {
        setInstallmentModal({
            open: true,
            data: {
                debtId: item.debtId,
                installmentId: item.installmentId,
                amount: item.amount,
                dueDate: item.dueDate,
                installmentDisplay: item.installment?.display,
                name: item.name
            }
        });
    };

    // Styling Helper
    const getAlertClass = (level: string) => {
        switch (level) {
            case 'RED': return 'critical';
            case 'ORANGE': return 'serious';
            case 'YELLOW': return 'warning';
            default: return 'safe';
        }
    };

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Thanh toán sắp tới</span>
                    {criticalCount > 0 && (
                        <Tag color="red" style={{ margin: 0, borderRadius: 10 }}>
                            {criticalCount} Lãi suất/Gấp
                        </Tag>
                    )}
                </div>
            }
            className="widget-card upcoming-widget"

            bordered={false}
            loading={isLoading}
        >
            <div className="upcoming-summary">
                <span className="label">Tổng cần thanh toán (10 ngày)</span>
                <span className="value">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="upcoming-payment-list">
                <List
                    dataSource={payments || []}
                    renderItem={(item: UpcomingPaymentItem) => {
                        const alertClass = getAlertClass(item.alertLevel);
                        const days = item.daysRemaining;
                        const dueDate = dayjs(item.dueDate).format('DD/MM');
                        const typeName = item.type === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 'Trả góp';

                        return (
                            <List.Item className={`payment-item ${alertClass}`} style={{ padding: '0 !important' }}>
                                <div className="payment-row" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>

                                    {/* Left: Icon & Info */}
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                                        <div
                                            className={`icon-wrapper type-${item.type === 'CREDIT_CARD' ? 'credit' : 'loan'}`}
                                        >
                                            {item.type === 'CREDIT_CARD' ? <CreditCardOutlined /> : <DollarCircleOutlined />}
                                        </div>

                                        <div className="info-content">
                                            {/* Row 1: Name & Period */}
                                            <div className="row-title">
                                                <div className="name">{item.name}</div>
                                                {item.installment && (
                                                    <span className="installment-text">
                                                        Kỳ {item.installment.display}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 2: Type & Due Date */}
                                            <div className="row-details">
                                                <span className="text-type">
                                                    {item.type === 'CREDIT_CARD' ? 'THẺ TÍN DỤNG' : 'TRẢ GÓP'}
                                                </span>
                                                <span className="pill-date">
                                                    Hạn: <b>{dueDate}</b>
                                                </span>
                                            </div>

                                            {/* Row 3: Countdown */}
                                            <div className="row-countdown">
                                                <span className={`pill-days ${alertClass}`}>
                                                    <ClockCircleOutlined />
                                                    {days <= 0 ? 'Hôm nay' : `${days} ngày`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Amount & Action */}
                                    <div className="right-info">
                                        <div className="amount">{formatCurrency(item.amount)}</div>
                                        <Button
                                            className="pay-btn"
                                            type="primary"
                                            onClick={() => item.type === 'CREDIT_CARD' ? handlePayCreditCard(item) : handlePayLoan(item)}
                                        >
                                            Thanh toán
                                        </Button>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                    locale={{ emptyText: <div style={{ padding: 20, textAlign: 'center', color: '#8c8c8c' }}>Không có khoản cần thanh toán</div> }}
                />
            </div>

            {/* Modals */}
            <PayStatementModal
                open={statementModal.open}
                onClose={() => setStatementModal({ ...statementModal, open: false })}
                wallet={statementModal.wallet}
                wallets={wallets || []}
                onSuccess={() => refetch()}
            />

            <PayInstallmentModal
                open={installmentModal.open}
                onClose={() => setInstallmentModal({ ...installmentModal, open: false })}
                data={installmentModal.data}
                onSuccess={() => refetch()}
            />
        </Card>
    );
};
