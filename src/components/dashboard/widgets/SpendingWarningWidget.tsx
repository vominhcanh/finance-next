import { analyticsApi } from '@/api/analytics.api';
import { SetLimitModal } from '@/components/profile/SetLimitModal';
import { BulbTwoTone, CalendarTwoTone, EditOutlined, RiseOutlined, SafetyCertificateTwoTone, ShoppingTwoTone, ThunderboltTwoTone } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Button, Card, Progress, ProgressProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import './Widgets.scss';

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
        <Card title="Cảnh báo chi tiêu" className="widget-card" size="small" bordered={false} loading={isLoading}>
            <div className="spending-warning-content">
                <div className="main-stats">
                    <div className="progress-container">
                        <Progress
                            type="circle"
                            percent={hasLimit ? Math.min(percentUsed, 100) : 100}
                            status={status}
                            strokeColor={color}
                            strokeWidth={10}
                            width={110}
                            format={() => (
                                <div className="progress-label">
                                    {hasLimit ? (
                                        <>
                                            <span className="percent" style={{ color: typeof color === 'string' ? color : '#4096ff' }}>
                                                {percentUsed?.toFixed(1)}%
                                            </span>
                                            <span className="label">Đã sử dụng</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="percent" style={{ color: '#8c8c8c', fontSize: 14 }}>--</span>
                                            <span className="label">Chưa có hạn mức</span>
                                        </>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                    <div className="spending-summary">
                        <div className="summary-item">
                            <span className="label">Đã chi tiêu</span>
                            <span className="value">
                                {formatCurrency(currentSpending)}
                                {spendingTrend !== 0 && (
                                    <span style={{ fontSize: 11, marginLeft: 6, color: isTrendBad ? '#ff4d4f' : '#52c41a' }}>
                                        {isTrendBad ? '+' : ''}{spendingTrend}%
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Hạn mức</span>
                            <div className="value limit" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {hasLimit ? (
                                    <>
                                        {formatCurrency(monthlyLimit)}
                                        <EditOutlined
                                            className='edit-icon'
                                            style={{ cursor: 'pointer', color: '#1890ff', fontSize: 13 }}
                                            onClick={() => setLimitModalOpen(true)}
                                        />
                                    </>
                                ) : (
                                    <Button
                                        type="link"
                                        size="small"
                                        style={{ padding: 0, height: 'auto', fontWeight: 600 }}
                                        onClick={() => setLimitModalOpen(true)}
                                    >
                                        Thiết lập ngay
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="summary-item highlight">
                            <span className="label">Còn lại</span>
                            <span className={`value ${hasLimit ? (remainingBudget < 0 ? 'negative' : 'positive') : ''}`}>
                                {hasLimit ? formatCurrency(remainingBudget) : '--'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="detailed-stats">
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="label">
                                <RiseOutlined style={{ color: '#1890ff' }} /> Trung bình/ngày
                            </span>
                            <span className="value">{formatCurrency(dailyAverage)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">
                                <SafetyCertificateTwoTone twoToneColor="#52c41a" /> Nên chi/ngày
                            </span>
                            {hasLimit ? (
                                <span className="value safe">{formatCurrency(safeDailySpend)}</span>
                            ) : (
                                <span className="value" style={{ color: '#bfbfbf' }}>--</span>
                            )}
                        </div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="label">
                                <ThunderboltTwoTone twoToneColor="#faad14" /> Dự kiến cuối tháng
                            </span>
                            <span className={`value ${hasLimit && projectedSpending > monthlyLimit ? 'warning' : ''}`}>
                                {formatCurrency(projectedSpending)}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="label">
                                <CalendarTwoTone twoToneColor="#722ed1" /> Ngày còn lại
                            </span>
                            <span className="value">{daysRemaining} ngày</span>
                        </div>
                    </div>
                </div>

                {/* Advice & Top Category Section */}
                {(adviceMessage || topCategory) && (
                    <div className="advice-container">
                        {topCategory && (
                            <div className="top-category-row">
                                <span className="label">
                                    <ShoppingTwoTone twoToneColor="#eb2f96" /> Top chi tiêu:
                                </span>
                                <span className="value">{topCategory.name} ({topCategory.percent}%)</span>
                            </div>
                        )}
                        {adviceMessage && (
                            <div className="advice-row">
                                <BulbTwoTone twoToneColor="#fadb14" style={{ fontSize: 16, marginTop: 2 }} />
                                <span className="text">{adviceMessage}</span>
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
