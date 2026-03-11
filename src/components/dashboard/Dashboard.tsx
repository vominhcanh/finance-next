import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    EyeOutlined,
    PieChartOutlined,
    ShoppingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Card, Grid, Space, SpinLoading } from 'antd-mobile';
import { useEffect, useState } from 'react';

import { MonthlyOverview, analyticsApi } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import { DailyFlowChart } from './charts/DailyFlowChart';
import { ExpenseStructureChart } from './charts/ExpenseStructureChart';
import { FinancialTrendChart } from './charts/FinancialTrendChart';
import { SpendingWarningWidget } from './widgets/SpendingWarningWidget';
import { UpcomingPaymentsWidget } from './widgets/UpcomingPaymentsWidget';

export const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyOverview | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    const data = await analyticsApi.getMonthlyOverview();
                    if (data && data.stats) {
                        setMonthlyData(data);
                    }
                } catch (analyticsError) {
                    console.warn('Analytics API not available:', analyticsError);
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 104px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SpinLoading color="primary" style={{ '--size': '36px' }} />
            </div>
        );
    }

    const renderStatCard = (
        title: string,
        value: string | number,
        trendValue: number | undefined,
        IconComponent: React.ComponentType<{ style?: React.CSSProperties }>,
        gradient: string
    ) => {
        const isPositive = (trendValue ?? 0) >= 0;
        const trendColor = isPositive ? '#00c853' : '#f51b1f';
        const trendText = trendValue ? (trendValue > 0 ? '+' : '') + trendValue + '%' : '0%';

        return (
            <Grid.Item>
                <Card
                    style={{ 
                        borderRadius: 20, 
                        background: '#ffffff', 
                        border: 'none',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                    }}
                    bodyStyle={{ padding: '16px 12px' }}
                >
                    <Space direction="vertical" block style={{ '--gap': '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '12px',
                                    background: gradient,
                                    color: '#fff',
                                    fontSize: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                <IconComponent style={{ color: '#fff' }} />
                            </div>
                            <div style={{ 
                                background: isPositive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(245, 27, 31, 0.1)', 
                                padding: '4px 8px', 
                                borderRadius: 100, 
                                color: trendColor, 
                                fontSize: 12, 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                <span>{trendText}</span>
                            </div>
                        </div>

                        <Space direction="vertical" block style={{ '--gap': '4px' }}>
                            <div style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 500 }}>
                                {title}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2c33', lineHeight: 1.2 }}>
                                {value}
                            </div>
                        </Space>
                    </Space>
                </Card>
            </Grid.Item>
        );
    };

    return (
        <Space direction="vertical" block style={{ padding: 12, paddingBottom: 100, background: '#f5f5f5', '--gap': '32px' }}>
            {/* Stats Grid */}
            <Grid columns={2} gap={16}>
                {/* Income Card */}
                {renderStatCard(
                    'Tổng Thu Nhập',
                    formatCurrency(monthlyData?.stats?.totalWalletBalance || 0),
                    monthlyData?.trends?.totalWalletBalance,
                    UserOutlined,
                    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
                )}

                {/* Expense Card */}
                {renderStatCard(
                    'Tổng Chi Tiêu',
                    formatCurrency(monthlyData?.stats?.totalExpense || 0),
                    monthlyData?.trends?.totalExpense,
                    ShoppingOutlined,
                    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
                )}

                {/* Balance Card */}
                {renderStatCard(
                    'Số Dư Hiện Tại',
                    formatCurrency(monthlyData?.stats?.netBalance || 0),
                    monthlyData?.trends?.netBalance,
                    EyeOutlined,
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                )}

                {/* Wallets/Other Card */}
                {renderStatCard(
                    'Tổng Số Ví',
                    monthlyData?.stats?.totalWallets || 0,
                    monthlyData?.trends?.totalWallets,
                    PieChartOutlined,
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                )}
            </Grid>

            {/* Warning Section */}
            <Grid columns={1} gap={16}>
                <Grid.Item>
                    <SpendingWarningWidget />
                </Grid.Item>
                <Grid.Item>
                    <UpcomingPaymentsWidget />
                </Grid.Item>
            </Grid>

            {/* Financial Charts Section */}
            <Grid columns={1} gap={16}>
                <Grid.Item>
                    <FinancialTrendChart />
                </Grid.Item>
                <Grid.Item>
                    <DailyFlowChart />
                </Grid.Item>
                <Grid.Item>
                    <ExpenseStructureChart />
                </Grid.Item>
            </Grid>
        </Space>
    );
};
