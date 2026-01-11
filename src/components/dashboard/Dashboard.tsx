import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    EyeOutlined,
    PieChartOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';

import { formatCurrency, formatDate } from '@utils/format.utils';
import { analyticsApi, DebtStatusItem } from '@api/analytics.api';
import { transactionApi } from '@api/transaction.api';
import { walletApi } from '@api/wallet.api';
import { WalletData } from '@/types/wallet.type';
import { TransactionData } from '@/types/transaction.type';
import { DashboardAnalytics } from './DashboardAnalytics';
import './Dashboard.scss';

export const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthlyData, setMonthlyData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
    const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [debtStatus, setDebtStatus] = useState<DebtStatusItem[]>([]);
    const [creditCardFees, setCreditCardFees] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [walletsData, transactionsData] = await Promise.all([
                    walletApi.getAll(),
                    transactionApi.getAll()
                ]);

                setWallets(Array.isArray(walletsData) ? walletsData : []);
                setRecentTransactions(transactionsData.data);
                try {
                    const [overview, debts, fees] = await Promise.all([
                        analyticsApi.getMonthlyOverview(),
                        analyticsApi.getDebtStatus(),
                        analyticsApi.getCreditCardFees()
                    ]);

                    if (overview && typeof overview === 'object') {
                        setMonthlyData({
                            totalIncome: overview.totalIncome || 0,
                            totalExpense: overview.totalExpense || 0,
                            balance: overview.balance || 0,
                        });
                    }
                    setDebtStatus(debts || []);
                    setCreditCardFees(fees);

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
            <DashboardAnalytics />

            <div style={{ height: '100px' }}></div>
        </div>
    );
};
