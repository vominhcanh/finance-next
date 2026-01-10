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
                setRecentTransactions(Array.isArray(transactionsData) ? transactionsData.slice(0, 5) : []);
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
                    console.log('Analytics Data:', { overview, debts, fees });
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

    const filteredTransactions = recentTransactions.filter(tx => {
        if (activeTab === 'ALL') return true;
        return tx.type === activeTab;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
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
            <div className="section-header">
                <h2>Giao Dịch Gần Đây</h2>
                <span className="view-more">Xem Tất Cả</span>
            </div>

            <div className="transaction-tabs">
                {['ALL', 'INCOME', 'EXPENSE'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab as any)}
                    >
                        {tab === 'ALL' ? 'Tất cả' : tab === 'INCOME' ? 'Thu Nhập' : 'Chi Tiêu'}
                    </button>
                ))}
            </div>

            <div className="transaction-list">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>Không tìm thấy giao dịch nào.</p>
                    </div>
                ) : (
                    filteredTransactions.map((tx) => (
                        <div className="list-item" key={tx._id}>
                            <div className="item-left">
                                <div className={`item-avatar ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                                    {tx.type === 'INCOME' ? <UserOutlined /> : <ShoppingOutlined />}
                                </div>
                                <div className="item-details">
                                    <h4 className="item-title">{tx.note || tx.categoryId || 'Giao dịch'}</h4>
                                    <p className="item-subtitle">
                                        {tx.type === 'INCOME' ? 'Nhận tiền' : 'Chi tiêu'} • {formatDate(tx.date)}
                                    </p>
                                </div>
                            </div>
                            <div className="item-right">
                                <span className={`item-amount ${tx.type === 'INCOME' ? 'positive' : 'negative'}`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div style={{ height: '100px' }}></div>
        </div>
    );
};
