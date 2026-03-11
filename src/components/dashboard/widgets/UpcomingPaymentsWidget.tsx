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
        const wallet = wallets.find((w: WalletData) => w._id === item.walletId);
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
                    <span style={{ fontSize: 16, fontWeight: 700 }}>Thanh toán sắp tới</span>
                    {criticalCount > 0 && (
                        <Tag color="red" style={{ margin: 0, borderRadius: 10 }}>
                            {criticalCount} gấp
                        </Tag>
                    )}
                </div>
            }
            bordered={false}
            loading={isLoading}
            style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', padding: '12px 16px', borderRadius: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#5f6368', fontWeight: 500 }}>Tổng cần chi (10 ngày)</span>
                <span style={{ fontSize: 18, color: '#f5222d', fontWeight: 700 }}>{formatCurrency(totalAmount)}</span>
            </div>

            <List
                dataSource={payments || []}
                style={{ border: 'none' }}
                renderItem={(item: UpcomingPaymentItem) => {
                    const alertClass = getAlertClass(item.alertLevel);
                    const days = item.daysRemaining;
                    const dueDate = dayjs(item.dueDate).format('DD/MM');
                    const isCreditCard = item.type === 'CREDIT_CARD';
                    
                    const getIconColor = () => {
                        if (alertClass === 'critical') return '#fff';
                        return isCreditCard ? '#1890ff' : '#52c41a';
                    };
                    const getIconBg = () => {
                        if (alertClass === 'critical') return '#f5222d'; 
                        return isCreditCard ? '#e6f4ff' : '#f6ffed';
                    };

                    return (
                        <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', width: '100%', gap: 12 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        width: 40, height: 40, borderRadius: 10, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        background: getIconBg(), color: getIconColor(), fontSize: 20, flexShrink: 0 
                                    }}>
                                        {isCreditCard ? <CreditCardOutlined /> : <DollarCircleOutlined />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ color: '#1f2c33', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                            {item.installment && (
                                                <span style={{ fontSize: 11, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, color: '#5f6368', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    Kỳ {item.installment.display}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
                                                {isCreditCard ? 'THẺ TÍN DỤNG' : 'TRẢ GÓP'}
                                            </span>
                                            <span>Hạn: <b style={{ color: '#1f2c33', fontWeight: 600 }}>{dueDate}</b></span>
                                        </div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            <span style={{ 
                                                fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4,
                                                background: days <= 0 ? '#fff1f0' : (days <= 3 ? '#fffbe6' : '#f6ffed'),
                                                color: days <= 0 ? '#f5222d' : (days <= 3 ? '#faad14' : '#52c41a')
                                            }}>
                                                <ClockCircleOutlined />
                                                {days <= 0 ? 'Hôm nay' : `${days} ngày`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f5222d' }}>{formatCurrency(item.amount)}</div>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{ borderRadius: 6, fontSize: 12, padding: '0 12px' }}
                                        onClick={() => isCreditCard ? handlePayCreditCard(item) : handlePayLoan(item)}
                                    >
                                        Thanh toán
                                    </Button>
                                </div>
                            </div>
                        </List.Item>
                    );
                }}
                locale={{ emptyText: <div style={{ padding: 20, textAlign: 'center', color: '#8c8c8c' }}>Không có khoản khoản nào cần thanh toán</div> }}
            />

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
