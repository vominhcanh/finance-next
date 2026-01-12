import { useState, useEffect } from 'react';
import { Spin, Button, message, Avatar } from 'antd';
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    WifiOutlined,
    MoreOutlined,
    PlusOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { walletApi } from '@api/wallet.api';
import { transactionApi } from '@api/transaction.api';
import { analyticsApi, MonthlyOverview } from '@api/analytics.api';
import { WalletData, WalletType, WalletForm } from '@/types/wallet.type';
import { TransactionData } from '@/types/transaction.type';
import { formatCurrency, formatDate } from '@utils/format.utils';
import { WalletAnalytics } from './WalletAnalytics';
import { WalletModal } from './WalletModal';
import './WalletList.scss';

const MOCK_CARD_EXPIRY = '12/2035';
const MOCK_INCOME_TARGET = 15000000; // Mock target for now

export const WalletList = () => {
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyOverview | null>(null);
    const [showBalance, setShowBalance] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [walletsData, transactionsResp, analyticsData] = await Promise.all([
                walletApi.getAll(),
                transactionApi.getAll({ limit: 5 }),
                analyticsApi.getMonthlyOverview()
            ]);

            setWallets(Array.isArray(walletsData) ? walletsData : []);
            setTransactions(transactionsResp.data || []);
            setMonthlyStats(analyticsData);
        } catch (error) {
            console.error('Failed to fetch wallet dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);

    const getCardThemeClass = (index: number) => {
        return `card-theme-${index % 3}`;
    };

    // Handlers
    const handleAddWallet = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleEditWallet = (wallet: WalletData) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (values: WalletForm) => {
        try {
            setModalLoading(true);
            if (editingWallet) {
                await walletApi.update(editingWallet._id, values);
                message.success('Cập nhật ví thành công');
            } else {
                await walletApi.create(values);
                message.success('Thêm ví mới thành công');
            }
            setIsModalOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Submit wallet error:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <Spin size="small" />
                <div className="loading-text">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="wallet-management-container">
            <div className="custom-header">
                <div className="icon-btn back-btn" onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div className="page-title">Quản lý ví</div>
                <Button type="text" className="icon-btn add-btn" onClick={handleAddWallet}>
                    <PlusOutlined />
                </Button>
            </div>

            {/* 1. Total Balance Section */}
            <div className="total-balance-section">
                <div className="label">Tổng tài sản</div>
                <div className="balance-row">
                    <div className="amount">
                        {showBalance ? formatCurrency(totalBalance, 'VND') : '******'}
                    </div>
                </div>
            </div>

            {/* 2. Wallet Cards Carousel */}
            <div className="wallet-carousel">
                {wallets.length === 0 ? (
                    <div className="wallet-card card-theme-0" onClick={handleAddWallet} style={{ cursor: 'pointer' }}>
                        <div className="card-header">
                            <span className="card-type">Chưa có ví</span>
                        </div>
                        <div className="card-footer">
                            <div className="balance-info">
                                <div className="info-value">Thêm ví mới</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    wallets.map((wallet, index) => (
                        <div
                            key={wallet._id}
                            className={`wallet-card ${getCardThemeClass(index)}`}
                            onClick={() => handleEditWallet(wallet)}
                            style={{
                                cursor: 'pointer',
                                background: wallet.color ? `linear-gradient(135deg, ${wallet.color} 0%, ${wallet.color}dd 100%)` : undefined,
                                borderColor: wallet.color ? 'transparent' : undefined,
                                color: wallet.color ? '#fff' : undefined
                            }}
                        >
                            <div className="card-header">
                                <div className="chip-icon">
                                    {/* Show Bank Logo if available */}
                                    {wallet.logo || wallet.bank?.logo ? (
                                        <img
                                            src={wallet.logo || wallet.bank?.logo}
                                            alt="logo"
                                            style={{
                                                height: 40,
                                                width: 'auto',
                                                maxWidth: 140,
                                                objectFit: 'contain',
                                                background: 'transparent'
                                            }}
                                        />
                                    ) : (
                                        wallet.type === WalletType.CREDIT_CARD || wallet.type === WalletType.BANK ? '💳' : '💵'
                                    )}
                                </div>
                                <div className="card-type" style={{ color: wallet.color ? '#fff' : undefined }}>
                                    {wallet.type === WalletType.CREDIT_CARD ? 'Thẻ Tín Dụng' : wallet.type === WalletType.BANK ? 'Ngân Hàng' : 'Tiền Mặt'}
                                    <WifiOutlined rotate={90} />
                                </div>
                            </div>

                            <div className="card-center" style={{ flex: 1 }}>
                                <div style={{ marginTop: 20, fontSize: 16, fontWeight: 600 }}>{wallet.name}</div>
                                <div style={{ fontSize: 14, opacity: 0.8 }}>{wallet.bankName || wallet.bank?.shortName}</div>
                            </div>

                            <div className="card-footer">
                                <div className="balance-info">
                                    <div className="info-label">Số dư hiện tại</div>
                                    <div className="info-value">
                                        {showBalance ? formatCurrency(wallet.balance, 'VND') : '****'}
                                        {showBalance ? (
                                            <EyeOutlined className="eye-icon" onClick={(e) => { e.stopPropagation(); setShowBalance(false); }} />
                                        ) : (
                                            <EyeInvisibleOutlined className="eye-icon" onClick={(e) => { e.stopPropagation(); setShowBalance(true); }} />
                                        )}
                                    </div>
                                </div>
                                <div className="expiry-info">
                                    {wallet.expirationDate ? formatDate(wallet.expirationDate as string) : (wallet.type === WalletType.CREDIT_CARD ? MOCK_CARD_EXPIRY : '')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <WalletAnalytics />
            <WalletModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialValues={editingWallet}
                loading={modalLoading}
            />
        </div>
    );
};
