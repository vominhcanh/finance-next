import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Spin } from 'antd';
import { PlusOutlined, BankOutlined, WalletOutlined, CreditCardOutlined } from '@ant-design/icons';
import { MobileLayout } from '@components/layout/MobileLayout';
import { PrivateRoute } from '@components/layout/PrivateRoute';
import { formatCurrency } from '@utils/format.utils';
import { walletApi } from '@api/wallet.api';
import { WalletData } from '@/types/wallet.type';

const { Title, Text } = Typography;

export const WalletList = () => {
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState<WalletData[]>([]);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                setLoading(true);
                const data = await walletApi.getAll();
                setWallets(data);
            } catch (error) {
                console.error('Error fetching wallets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWallets();
    }, []);

    const getWalletIcon = (type: string) => {
        switch (type) {
            case 'BANK':
                return <BankOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
            case 'CREDIT_CARD':
                return <CreditCardOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
            default:
                return <WalletOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
        }
    };

    if (loading) {
        return (
            <PrivateRoute>
                <MobileLayout>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                    </div>
                </MobileLayout>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute>
            <MobileLayout>
                <div>
                    <Title level={3} style={{ marginBottom: '16px' }}>
                        Ví của tôi
                    </Title>

                    {!wallets || wallets.length === 0 ? (
                        <Card>
                            <Text type="secondary">Chưa có ví nào</Text>
                        </Card>
                    ) : (
                        wallets.map((wallet) => (
                            <Card key={wallet._id} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {getWalletIcon(wallet.type)}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {wallet.name}
                                                </Text>
                                                <br />
                                                <Tag color={wallet.type === 'CREDIT_CARD' ? 'purple' : 'blue'}>
                                                    {wallet.type === 'CASH' && 'Tiền mặt'}
                                                    {wallet.type === 'BANK' && 'Ngân hàng'}
                                                    {wallet.type === 'SAVING' && 'Tiết kiệm'}
                                                    {wallet.type === 'CREDIT_CARD' && 'Thẻ tín dụng'}
                                                </Tag>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: '18px',
                                                        color: wallet.balance < 0 ? '#ff4d4f' : '#52c41a',
                                                    }}
                                                >
                                                    {formatCurrency(wallet.balance)}
                                                </Text>
                                                {wallet.type === 'CREDIT_CARD' && wallet.creditLimit && (
                                                    <>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Hạn mức: {formatCurrency(wallet.creditLimit)}
                                                        </Text>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}

                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<PlusOutlined />}
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '24px',
                            width: '56px',
                            height: '56px',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                        }}
                    />
                </div>
            </MobileLayout>
        </PrivateRoute>
    );
};
