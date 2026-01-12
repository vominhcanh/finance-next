import { analyticsApi } from '@/api/analytics.api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card, Progress, ProgressProps } from 'antd';
import dayjs from 'dayjs';
import './Widgets.scss';

export const SpendingWarningWidget = () => {
    const { data: warning, isLoading } = useQuery({
        queryKey: ['spendingWarning'],
        queryFn: analyticsApi.getSpendingWarning,
    });

    if (!warning) return null;

    const { currentSpending, monthlyLimit, percentUsed, alertLevel } = warning;

    let status: 'success' | 'warning' | 'exception' | 'normal' | 'active' = 'active';
    let color: ProgressProps['strokeColor'] = '#52c41a'; // SAFE

    if (alertLevel === 'WARNING') {
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
    const dailyAverage = currentSpending / currentDay;
    const projectedSpending = dailyAverage * daysInMonth;
    const safeDailySpend = daysRemaining > 0 ? Math.max(0, remainingBudget / daysRemaining) : 0;

    return (
        <Card title="Cảnh báo chi tiêu" className="widget-card" size="small" bordered={false}>
            <div className="spending-warning-content">
                <div className="main-stats">
                    <div className="progress-container">
                        <Progress
                            type="circle"
                            percent={Math.min(percentUsed, 100)}
                            status={status}
                            strokeColor={color}
                            strokeWidth={10}
                            width={110}
                            format={(percent) => (
                                <div className="progress-label">
                                    <span className="percent" style={{ color: typeof color === 'string' ? color : '#4096ff' }}>
                                        {percent?.toFixed(1)}%
                                    </span>
                                    <span className="label">Đã sử dụng</span>
                                </div>
                            )}
                        />
                    </div>
                    <div className="spending-summary">
                        <div className="summary-item">
                            <span className="label">Đã chi tiêu</span>
                            <span className="value">{formatCurrency(currentSpending)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Hạn mức</span>
                            <span className="value limit">{formatCurrency(monthlyLimit)}</span>
                        </div>
                        <div className="summary-item highlight">
                            <span className="label">Còn lại</span>
                            <span className={`value ${remainingBudget < 0 ? 'negative' : 'positive'}`}>
                                {formatCurrency(remainingBudget)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="detailed-stats">
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="label">Trung bình/ngày</span>
                            <span className="value">{formatCurrency(dailyAverage)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Nên chi/ngày</span>
                            <span className="value safe">{formatCurrency(safeDailySpend)}</span>
                        </div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="label">Dự kiến cuối tháng</span>
                            <span className={`value ${projectedSpending > monthlyLimit ? 'warning' : ''}`}>
                                {formatCurrency(projectedSpending)}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Ngày còn lại</span>
                            <span className="value">{daysRemaining} ngày</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
