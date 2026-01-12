import { analyticsApi } from '@/api/analytics.api';
import { UpcomingPaymentItem } from '@/types/analytics.type';
import { BankOutlined, ClockCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card, List } from 'antd';
import dayjs from 'dayjs';
import './Widgets.scss';

export const UpcomingPaymentsWidget = () => {
    const { data: payments, isLoading } = useQuery({
        queryKey: ['upcomingPayments'],
        queryFn: analyticsApi.getUpcomingPayments,
    });


    const totalAmount = payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const criticalCount = payments?.filter(item => item.daysRemaining <= 5).length || 0;

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Thanh toán sắp tới</span>
                    {criticalCount > 0 && (
                        <span style={{
                            backgroundColor: '#ff4d4f', color: 'white',
                            fontSize: 11, padding: '2px 8px', borderRadius: 10,
                            fontWeight: 'normal'
                        }}>
                            {criticalCount} cần chú ý
                        </span>
                    )}
                </div>
            }
            className="widget-card upcoming-widget"
            size="small"
            bordered={false}
        >
            <div className="upcoming-summary">
                <span className="label">Tổng cần thanh toán</span>
                <span className="value">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="upcoming-payment-list">
                <List
                    dataSource={payments || []}
                    renderItem={(item: UpcomingPaymentItem) => {
                        let tagClass = 'safe';
                        const days = item.daysRemaining;
                        if (days <= 10) tagClass = 'warning';
                        if (days <= 5) tagClass = 'serious';
                        if (days <= 2) tagClass = 'critical';

                        const dueDate = dayjs(item.dueDate);
                        // Get day name in Vietnamese
                        const dayName = dueDate.format('dddd');
                        // Map English day names to Vietnamese if needed, or use 'vi' locale
                        const dayMap: Record<string, string> = {
                            'Sunday': 'CN', 'Monday': 'T2', 'Tuesday': 'T3', 'Wednesday': 'T4',
                            'Thursday': 'T5', 'Friday': 'T6', 'Saturday': 'T7'
                        };
                        const shortDay = dayMap[dueDate.format('dddd')] || dueDate.format('dd');

                        return (
                            <List.Item className={`item-${tagClass}`}>
                                <div className="payment-item-row">
                                    <div className="left-info">
                                        <div className="icon-wrapper" style={{
                                            background: item.type === 'CREDIT_CARD' ? '#e6f7ff' : '#f9f0ff',
                                        }}>
                                            {item.type === 'CREDIT_CARD' ? (
                                                <CreditCardOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                                            ) : (
                                                <BankOutlined style={{ color: '#722ed1', fontSize: 20 }} />
                                            )}
                                        </div>
                                        <div className="info-content">
                                            <div className="name-row">
                                                <span className="name">{item.name}</span>
                                                {item.installment && (
                                                    <span className="installment-tag">
                                                        Kỳ {item.installment.display}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="date-info">
                                                <span className={`day-tag ${tagClass}`}>
                                                    {shortDay}
                                                </span>
                                                <span className="date-text">
                                                    {dueDate.format('DD/MM')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="right-info">
                                        <div className="amount">{formatCurrency(item.amount)}</div>
                                        <div className={`days-chip ${tagClass}`}>
                                            <ClockCircleOutlined />
                                            {item.daysRemaining > 0 ? `Còn ${item.daysRemaining} ngày` : 'Hôm nay'}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                    locale={{ emptyText: 'Không có khoản thanh toán nào sắp tới' }}
                />
            </div>
        </Card>
    );
};
