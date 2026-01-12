import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    EyeOutlined,
    PieChartOutlined,
    ShoppingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Col, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';

import { MonthlyOverview, analyticsApi } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import { DailyFlowChart } from './charts/DailyFlowChart';
import { ExpenseStructureChart } from './charts/ExpenseStructureChart';
import { FinancialTrendChart } from './charts/FinancialTrendChart';
import './Dashboard.scss';
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
            <div className="dashboard-loading-container">
                <Spin />
                <div className="loading-text">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="stats-grid">
                {/* Income Card -> Total Wallet Balance */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-purple">
                            <UserOutlined />
                        </div>
                        <div className={`trend ${monthlyData?.trends?.totalWalletBalance && monthlyData.trends.totalWalletBalance >= 0 ? 'positive' : 'negative'}`}>
                            {monthlyData?.trends?.totalWalletBalance && monthlyData.trends.totalWalletBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData?.stats?.totalWalletBalance || 0)}</div>
                    <div className="card-label">
                        Tổng Thu Nhập <span className={`highlight-${monthlyData?.trends?.totalWalletBalance && monthlyData.trends.totalWalletBalance >= 0 ? 'green' : 'red'}`}>
                            {monthlyData?.trends?.totalWalletBalance ? (monthlyData.trends.totalWalletBalance > 0 ? '+' : '') + monthlyData.trends.totalWalletBalance + '%' : '0%'}
                        </span>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-pink">
                            <ShoppingOutlined />
                        </div>
                        <div className={`trend ${monthlyData?.trends?.totalExpense && monthlyData.trends.totalExpense >= 0 ? 'negative' : 'positive'}`}>
                            {monthlyData?.trends?.totalExpense && monthlyData.trends.totalExpense >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData?.stats?.totalExpense || 0)}</div>
                    <div className="card-label">
                        Tổng Chi Tiêu <span className={`highlight-${monthlyData?.trends?.totalExpense && monthlyData.trends.totalExpense >= 0 ? 'green' : 'red'}`}>
                            {monthlyData?.trends?.totalExpense ? (monthlyData.trends.totalExpense > 0 ? '+' : '') + monthlyData.trends.totalExpense + '%' : '0%'}
                        </span>
                    </div>
                </div>

                {/* Balance Card -> Net Flow */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-cyan">
                            <EyeOutlined />
                        </div>
                        <div className={`trend ${monthlyData?.trends?.netBalance && monthlyData.trends.netBalance >= 0 ? 'positive' : 'negative'}`}>
                            {monthlyData?.trends?.netBalance && monthlyData.trends.netBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData?.stats?.netBalance || 0)}</div>
                    <div className="card-label">
                        Số Dư Hiện Tại <span className={`highlight-${monthlyData?.trends?.netBalance && monthlyData.trends.netBalance >= 0 ? 'green' : 'red'}`}>
                            {monthlyData?.trends?.netBalance ? (monthlyData.trends.netBalance > 0 ? '+' : '') + monthlyData.trends.netBalance + '%' : '0%'}
                        </span>
                    </div>
                </div>

                {/* Wallets/Other Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-teal">
                            <PieChartOutlined />
                        </div>
                        <div className={`trend ${monthlyData?.trends?.totalWallets && monthlyData.trends.totalWallets >= 0 ? 'positive' : 'negative'}`}>
                            {monthlyData?.trends?.totalWallets && monthlyData.trends.totalWallets >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        </div>
                    </div>
                    <div className="card-value">{monthlyData?.stats?.totalWallets || 0}</div>
                    <div className="card-label">
                        Tổng Số Ví <span className={`highlight-${monthlyData?.trends?.totalWallets && monthlyData.trends.totalWallets >= 0 ? 'green' : 'red'}`}>
                            {monthlyData?.trends?.totalWallets ? (monthlyData.trends.totalWallets > 0 ? '+' : '') + monthlyData.trends.totalWallets + '%' : '0%'}
                        </span>
                    </div>
                </div>
            </div>
            {/* Warning Section - Priority 1 */}
            <div className="warning-section">
                <Row gutter={[16, 16]}>
                    <Col span={24} md={12}>
                        <SpendingWarningWidget />
                    </Col>
                    <Col span={24} md={12}>
                        <UpcomingPaymentsWidget />
                    </Col>
                </Row>
            </div>
            {/* Financial Charts Section */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 16 }}>
                {/* Main Trend Chart */}
                <div style={{ gridColumn: 'span 12' }} className="trend-chart-col">
                    <FinancialTrendChart />
                </div>

                {/* Daily Flow */}
                <div style={{ gridColumn: 'span 12' }} className="flow-chart-col">
                    <DailyFlowChart />
                </div>

                {/* Structure */}
                <div style={{ gridColumn: 'span 12' }} className="structure-chart-col">
                    <ExpenseStructureChart />
                </div>
            </div>

            <div style={{ height: '100px' }}></div>
        </div>
    );
};
