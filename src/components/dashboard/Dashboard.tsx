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

import { WalletData } from '@/types/wallet.type';
import { analyticsApi } from '@api/analytics.api';
import { walletApi } from '@api/wallet.api';
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
    const [monthlyData, setMonthlyData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [wallets, setWallets] = useState<WalletData[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const walletsData = await walletApi.getAll();
                setWallets(Array.isArray(walletsData) ? walletsData : []);

                try {
                    const overview = await analyticsApi.getMonthlyOverview();

                    if (overview && typeof overview === 'object') {
                        setMonthlyData({
                            totalIncome: overview.totalIncome || 0,
                            totalExpense: overview.totalExpense || 0,
                            balance: overview.balance || 0,
                        });
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
                <Spin size="small" />
                <div className="loading-text">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="stats-grid">
                {/* Income Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-purple">
                            <UserOutlined />
                        </div>
                        <div className="trend positive">
                            <ArrowUpOutlined />
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData.totalIncome)}</div>
                    <div className="card-label">
                        Tổng Thu Nhập <span className="highlight-green">+4.8%</span>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-pink">
                            <ShoppingOutlined />
                        </div>
                        <div className="trend positive">
                            <ArrowUpOutlined />
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData.totalExpense)}</div>
                    <div className="card-label">
                        Tổng Chi Tiêu <span className="highlight-green">+2.5%</span>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-cyan">
                            <EyeOutlined />
                        </div>
                        <div className="trend negative">
                            <ArrowDownOutlined />
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(monthlyData.balance)}</div>
                    <div className="card-label">
                        Số Dư Hiện Tại <span className="highlight-red">-1.8%</span>
                    </div>
                </div>

                {/* Wallets/Other Card */}
                <div className="stat-card">
                    <div className="card-top">
                        <div className="icon-circle gradient-teal">
                            <PieChartOutlined />
                        </div>
                        <div className="trend positive">
                            <ArrowUpOutlined />
                        </div>
                    </div>
                    <div className="card-value">{wallets.length}</div>
                    <div className="card-label">
                        Tổng Số Ví <span className="highlight-green">+4.8%</span>
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
