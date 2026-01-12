import { TransactionData } from '@/types/transaction.type';
import { WalletData, WalletForm, WalletType } from '@/types/wallet.type';
import {
    ArrowRightOutlined,
    EditOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    PlusOutlined,
    WifiOutlined
} from '@ant-design/icons';
import { analyticsApi, MonthlyOverview } from '@api/analytics.api';
import { transactionApi } from '@api/transaction.api';
import { walletApi } from '@api/wallet.api';
import { formatCurrency, formatDate, isLightColor } from '@utils/format.utils';
import { Button, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PayStatementModal } from './PayStatementModal';
import { WalletAnalytics } from './WalletAnalytics';
import './WalletList.scss';
import { WalletModal } from './WalletModal';

export const WalletList = () => {
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyOverview | null>(null);
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [showBalance, setShowBalance] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Pay Statement State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payWallet, setPayWallet] = useState<WalletData | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [walletsData, transactionsResp, analyticsData] = await Promise.all([
                walletApi.getAll(),
                transactionApi.getAll({ limit: 5 }),
                analyticsApi.getMonthlyOverview()
            ]);

            const loadedWallets = Array.isArray(walletsData) ? walletsData : [];
            setWallets(loadedWallets);
            setTransactions(transactionsResp.data || []);
            setMonthlyStats(analyticsData);

            // Set default active wallet
            if (!activeWalletId && loadedWallets.length > 0) {
                setActiveWalletId(loadedWallets[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch wallet dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalBalance = wallets.reduce((sum, wallet) => {
        if (wallet.type === WalletType.CREDIT_CARD) {
            // Debt = Available (balance) - Limit
            // e.g. Limit 20M, Balance 18M -> Debt -2M
            return sum + (wallet.balance - (wallet.creditLimit || 0));
        }
        return sum + (wallet.balance || 0);
    }, 0);

    const getCardThemeClass = (index: number) => {
        const themeIndex = index % 3;
        const patternIndex = index % 4;
        return `card-theme-${themeIndex} pattern-${patternIndex}`;
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

    const handlePayStatement = (wallet: WalletData) => {
        setPayWallet(wallet);
        setIsPayModalOpen(true);
    };

    const handleModalSubmit = async (values: WalletForm) => {
        try {
            setModalLoading(true);
            if (editingWallet) {
                await walletApi.update(editingWallet._id, values);
                toast.success('Cập nhật ví thành công');
            } else {
                await walletApi.create(values);
                toast.success('Thêm ví mới thành công');
            }
            setIsModalOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Submit wallet error:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <Spin />
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
                    wallets.map((wallet, index) => {
                        const isActive = activeWalletId === wallet._id;
                        return (
                            <div
                                key={wallet._id}
                                className={`wallet-card ${getCardThemeClass(index)} ${wallet.color ? (isLightColor(wallet.color) ? 'light-bg' : 'dark-bg') : (index % 3 === 1 ? 'dark-bg' : 'light-bg')}`}
                                onClick={() => setActiveWalletId(wallet._id)}
                                style={{
                                    cursor: 'pointer',
                                    background: wallet.color ? `linear-gradient(135deg, ${wallet.color} 0%, ${wallet.color}dd 100%)` : undefined,
                                    borderColor: isActive ? '#1890ff' : (wallet.color ? 'transparent' : undefined),
                                    borderWidth: 2,
                                    borderStyle: 'solid',
                                    color: wallet.color ? (isLightColor(wallet.color) ? '#000' : '#fff') : undefined,
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.3s ease'
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
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); handleEditWallet(wallet); }}
                                                className="edit-btn-header"
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    padding: '4px 10px',
                                                    borderRadius: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    background: wallet.color ? (isLightColor(wallet.color) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)') : 'rgba(0,0,0,0.05)',
                                                    backdropFilter: 'blur(4px)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <EditOutlined />
                                                <span>Chỉnh sửa</span>
                                            </div>
                                            <div className="card-type" style={{ color: wallet.color ? (isLightColor(wallet.color) ? '#000' : '#fff') : undefined }}>
                                                {wallet.type === WalletType.CREDIT_CARD ? 'Thẻ Tín Dụng' : wallet.type === WalletType.BANK ? 'Ngân Hàng' : 'Tiền Mặt'}
                                                <WifiOutlined rotate={90} />
                                            </div>
                                        </div>

                                        {/* Pay Button - Moved Here */}
                                        {wallet.type === WalletType.CREDIT_CARD && ((wallet.creditLimit || 0) - wallet.balance > 0) && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePayStatement(wallet);
                                                }}
                                                className="pay-btn-header"
                                                style={{
                                                    padding: '6px 16px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    background: '#fff',
                                                    borderRadius: 20,
                                                    cursor: 'pointer',
                                                    color: wallet.color || '#1890ff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    whiteSpace: 'nowrap',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}
                                            >
                                                Thanh toán
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-center" style={{ flex: 1 }}>
                                    <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600 }}>{wallet.name}</div>
                                    <div style={{ fontSize: 14, opacity: 0.8 }}>{wallet.bankName || wallet.bank?.shortName}</div>

                                    {wallet.type === WalletType.CREDIT_CARD && (
                                        <div className="credit-card-metrics" style={{ marginTop: 'auto', paddingTop: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                                <span style={{ fontWeight: 400, opacity: 0.85 }}>Hạn mức tín dụng:</span>
                                                <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>{formatCurrency(wallet.creditLimit || 0)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ fontWeight: 400, opacity: 0.85 }}>Dư nợ hiện tại:</span>
                                                <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>
                                                    {formatCurrency((wallet.creditLimit || 0) - wallet.balance)}
                                                </span>
                                            </div>

                                            {/* Divider for visual separation */}
                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginTop: 12, marginBottom: 8 }}></div>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer" style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <div className="balance-info">
                                        <div className="info-label" style={{ opacity: 0.85, fontSize: 13, marginBottom: 4 }}>
                                            {wallet.type === WalletType.CREDIT_CARD ? 'Số dư khả dụng' : 'Số dư hiện tại'}
                                        </div>
                                        <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }}>
                                                {showBalance ? formatCurrency(wallet.balance, 'VND') : '****'}
                                            </span>

                                            {showBalance ? (
                                                <div onClick={(e) => { e.stopPropagation(); setShowBalance(false); }} style={{ display: 'flex', cursor: 'pointer', opacity: 0.7 }}>
                                                    <EyeOutlined style={{ fontSize: 18 }} />
                                                </div>
                                            ) : (
                                                <div onClick={(e) => { e.stopPropagation(); setShowBalance(true); }} style={{ display: 'flex', cursor: 'pointer', opacity: 0.7 }}>
                                                    <EyeInvisibleOutlined style={{ fontSize: 18 }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="actions" style={{ marginBottom: 6 }}>
                                        <div className="expiry-info" style={{ opacity: 0.9, fontSize: 14, fontWeight: 500 }}>
                                            {wallet.type === WalletType.CREDIT_CARD
                                                ? (wallet.statementDate ? `Ngày sao kê: ${wallet.statementDate}` : '')
                                                : (wallet.expirationDate ? formatDate(wallet.expirationDate as string) : '')
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <WalletAnalytics activeWalletId={activeWalletId} />
            <WalletModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialValues={editingWallet}
                loading={modalLoading}
            />
            <PayStatementModal
                open={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                wallet={payWallet}
                wallets={wallets}
                onSuccess={fetchData}
            />
        </div >
    );
};
