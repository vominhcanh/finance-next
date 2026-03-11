
import { WalletData, WalletForm, WalletType } from '@/types/wallet.type';
import {
    ArrowRightOutlined,
    EditOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    PlusOutlined,
    WifiOutlined
} from '@ant-design/icons';
import { analyticsApi } from '@api/analytics.api';
import { transactionApi } from '@api/transaction.api';
import { walletApi } from '@api/wallet.api';
import { formatCurrency, formatDate, isLightColor } from '@utils/format.utils';
import { Space, SpinLoading } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PayStatementModal } from './PayStatementModal';
import { WalletAnalytics } from './WalletAnalytics';
import { WalletModal } from './WalletModal';

export const WalletList = () => {
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [showBalance, setShowBalance] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payWallet, setPayWallet] = useState<WalletData | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [walletsData] = await Promise.all([
                walletApi.getAll(),
                transactionApi.getAll({ limit: 5 }),
                analyticsApi.getMonthlyOverview()
            ]);

            const loadedWallets = Array.isArray(walletsData) ? walletsData : [];
            setWallets(loadedWallets);

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
            return sum + (wallet.balance - (wallet.creditLimit || 0));
        }
        return sum + (wallet.balance || 0);
    }, 0);

    const getCardThemeClass = (index: number) => {
        return index % 3 === 0 ? 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
            : index % 3 === 1 ? 'linear-gradient(135deg, #1f2c33 0%, #000000 100%)'
            : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)';
    };

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
            fetchData();
        } catch (error) {
            console.error('Submit wallet error:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
                <SpinLoading color="primary" />
                <div style={{ color: 'var(--adm-color-primary)' }}>Đang tải thông tin...</div>
            </div>
        );
    }

    return (
        <Space direction="vertical" block style={{ padding: 20, background: '#f5f5f5', marginBottom: 150 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2c33' }}>Quản lý ví</div>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleAddWallet}>
                    <PlusOutlined />
                </div>
            </div>

            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: '#8c98a4', fontWeight: 500 }}>Tổng tài sản</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--adm-color-primary)' }}>
                        {showBalance ? formatCurrency(totalBalance, 'VND') : '******'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20, marginRight: -20, paddingRight: 20 }}>
                {wallets.length === 0 ? (
                    <div onClick={handleAddWallet} style={{
                        minWidth: 380, aspectRatio: '1.586', borderRadius: 20, padding: 20, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Chưa có ví</div>
                        <div>Thêm ví mới</div>
                    </div>
                ) : (
                    wallets.map((wallet, index) => {
                        const isActive = activeWalletId === wallet._id;
                        const isLight = wallet.color ? isLightColor(wallet.color) : (index % 3 === 0 || index % 3 === 2);
                        const textColor = isLight ? '#000' : '#fff';
                        const background = wallet.color ? `linear-gradient(135deg, ${wallet.color} 0%, ${wallet.color}dd 100%)` : getCardThemeClass(index);

                        return (
                            <div
                                key={wallet._id}
                                onClick={() => setActiveWalletId(wallet._id)}
                                style={{
                                    minWidth: 340, aspectRatio: '1.586', borderRadius: 20, padding: 20, cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                    background: background,
                                    borderColor: isActive ? 'var(--adm-color-primary)' : 'transparent',
                                    borderWidth: 2, borderStyle: 'solid',
                                    color: textColor, transition: 'all 0.3s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 24, display: 'flex', alignItems: 'center' }}>
                                        {wallet.logo || wallet.bank?.logo ? (
                                            <img
                                                src={wallet.logo || wallet.bank?.logo}
                                                alt="logo"
                                                style={{ height: 40, width: 'auto', maxWidth: 140, objectFit: 'contain', background: 'transparent' }}
                                            />
                                        ) : (
                                            wallet.type === WalletType.CREDIT_CARD || wallet.type === WalletType.BANK ? '💳' : '💵'
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); handleEditWallet(wallet); }}
                                                style={{
                                                    cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 12,
                                                    display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)', transition: 'all 0.2s',
                                                    background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)'
                                                }}
                                            >
                                                <EditOutlined />
                                                <span>Chỉnh sửa</span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {wallet.type === WalletType.CREDIT_CARD ? 'Thẻ Tín Dụng' : wallet.type === WalletType.BANK ? 'Ngân Hàng' : 'Tiền Mặt'}
                                                <WifiOutlined rotate={90} />
                                            </div>
                                        </div>

                                        {wallet.type === WalletType.CREDIT_CARD && ((wallet.creditLimit || 0) - wallet.balance > 0) && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePayStatement(wallet);
                                                }}
                                                style={{
                                                    padding: '6px 16px', fontSize: 13, fontWeight: 600, background: '#fff', borderRadius: 20,
                                                    cursor: 'pointer', color: wallet.color || 'var(--adm-color-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4
                                                }}
                                            >
                                                Thanh toán
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600 }}>{wallet.name}</div>
                                    <div style={{ fontSize: 14, opacity: 0.8 }}>{wallet.bankName || wallet.bank?.shortName}</div>

                                    {wallet.type === WalletType.CREDIT_CARD && (
                                        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
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
                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginTop: 12, marginBottom: 8 }}></div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ opacity: 0.85, fontSize: 13, marginBottom: 4 }}>
                                            {wallet.type === WalletType.CREDIT_CARD ? 'Số dư khả dụng' : 'Số dư hiện tại'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                                    <div style={{ marginBottom: 6 }}>
                                        <div style={{ opacity: 0.9, fontSize: 14, fontWeight: 500 }}>
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
        </Space>
    );
};
