import { analyticsApi } from '@/api/analytics.api';
import { SetLimitModal } from '@/components/profile/SetLimitModal';
import { BulbTwoTone, CalendarTwoTone, EditOutlined, RiseOutlined, SafetyCertificateTwoTone, ShoppingTwoTone, ThunderboltTwoTone } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Button, Card, Progress, ProgressProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';


export const SpendingWarningWidget = () => {
    const { data: warning, isLoading } = useQuery({
        queryKey: ['spendingWarning'],
        queryFn: analyticsApi.getSpendingWarning,
    });

    const [limitModalOpen, setLimitModalOpen] = useState(false);

    if (!warning) return null;

    const {
        currentSpending,
        monthlyLimit,
        percentUsed,
        alertLevel,
        projectedSpending,
        spendingTrend,
        dailyAverage,
        safeDailySpend,
        topCategory,
        adviceMessage
    } = warning;

    const hasLimit = monthlyLimit > 0;

    let status: 'success' | 'warning' | 'exception' | 'normal' | 'active' = 'active';
    let color: ProgressProps['strokeColor'] = '#52c41a'; // SAFE

    if (!hasLimit) {
        status = 'normal';
        color = '#d9d9d9'; // Grey for no limit
    } else if (alertLevel === 'WARNING') {
        status = 'normal';
        color = '#faad14';
    } else if (alertLevel === 'OVERSPENT') {
        status = 'exception';
        color = '#ff4d4f';
    } else {
        // Safe gradient
        color = { '0%': '#36cfc9', '100%': '#4096ff' };
    }

    const today = dayjs();
    const daysInMonth = today.daysInMonth();
    const currentDay = today.date();
    const daysRemaining = daysInMonth - currentDay;

    const remainingBudget = monthlyLimit - currentSpending;

    // Trend Logic: Positive trend (>0) means spending MORE -> Bad (Red). Negative (<0) means spending LESS -> Good (Green).
    const isTrendBad = spendingTrend > 0;

    return (
        <Card 
            title={<div style={{ fontSize: 16, fontWeight: 700 }}>Cảnh báo chi tiêu</div>} 
            size="small" 
            bordered={false} 
            loading={isLoading}
            style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Main Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                        <Progress
                            type="circle"
                            percent={hasLimit ? Math.min(percentUsed, 100) : 100}
                            status={status}
                            strokeColor={color}
                            strokeWidth={10}
                            width={100}
                            format={() => (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                    {hasLimit ? (
                                        <>
                                            <span style={{ color: typeof color === 'string' ? color : '#4096ff', fontSize: 18, fontWeight: 700 }}>
                                                {percentUsed?.toFixed(1)}%
                                            </span>
                                            <span style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>Đã dùng</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: '#8c8c8c', fontSize: 14 }}>--</span>
                                        </>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Đã chi tiêu</span>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2c33' }}>{formatCurrency(currentSpending)}</div>
                                {spendingTrend !== 0 && (
                                    <div style={{ fontSize: 11, color: isTrendBad ? '#ff4d4f' : '#52c41a' }}>
                                        {isTrendBad ? '+' : ''}{spendingTrend}%
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Hạn mức</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {hasLimit ? (
                                    <>
                                        <span style={{ fontWeight: 600, fontSize: 15 }}>{formatCurrency(monthlyLimit)}</span>
                                        <EditOutlined style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => setLimitModalOpen(true)} />
                                    </>
                                ) : (
                                    <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setLimitModalOpen(true)}>
                                        Thiết lập
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: hasLimit ? (remainingBudget < 0 ? '#fff1f0' : '#f6ffed') : '#f5f5f5', borderRadius: 8 }}>
                            <span style={{ color: '#1f2c33', fontSize: 13, fontWeight: 500 }}>Còn lại</span>
                            <span style={{ fontWeight: 700, fontSize: 15, color: hasLimit ? (remainingBudget < 0 ? '#ff4d4f' : '#52c41a') : '#1f2c33' }}>
                                {hasLimit ? formatCurrency(remainingBudget) : '--'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}><RiseOutlined style={{ color: '#1890ff' }} /> TB/ngày</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(dailyAverage)}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}><SafetyCertificateTwoTone twoToneColor="#52c41a" /> Nên chi/ngày</span>
                            <span style={{ fontWeight: 600, fontSize: 14, color: '#52c41a' }}>{hasLimit ? formatCurrency(safeDailySpend) : '--'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}><ThunderboltTwoTone twoToneColor="#faad14" /> Dự kiến cuối t.</span>
                            <span style={{ fontWeight: 600, fontSize: 14, color: hasLimit && projectedSpending > monthlyLimit ? '#ff4d4f' : '#1f2c33' }}>
                                {formatCurrency(projectedSpending)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}><CalendarTwoTone twoToneColor="#722ed1" /> Ngày còn lại</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{daysRemaining} ngày</span>
                        </div>
                    </div>
                </div>

                {/* Advice & Top Category Section */}
                {(adviceMessage || topCategory) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {topCategory && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                <span style={{ color: '#8c8c8c' }}><ShoppingTwoTone twoToneColor="#eb2f96" /> Top chi tiêu:</span>
                                <span style={{ fontWeight: 600 }}>{topCategory.name} ({topCategory.percent}%)</span>
                            </div>
                        )}
                        {adviceMessage && (
                            <div style={{ display: 'flex', gap: 8, background: '#fffbe6', padding: 12, borderRadius: 8, border: '1px solid #ffe58f', alignItems: 'flex-start' }}>
                                <BulbTwoTone twoToneColor="#fadb14" style={{ fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: '#8a6d3b', lineHeight: 1.4 }}>{adviceMessage}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SetLimitModal
                open={limitModalOpen}
                onClose={() => setLimitModalOpen(false)}
                currentLimit={monthlyLimit}
            />
        </Card>
    );
};
