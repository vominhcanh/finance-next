import { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Button, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MobileLayout } from '@components/layout/MobileLayout';
import { PrivateRoute } from '@components/layout/PrivateRoute';
import { formatCurrency, formatDate } from '@utils/format.utils';
import { transactionApi } from '@api/transaction.api';
import { TransactionData } from '@/types/transaction.type';

const { Title, Text } = Typography;

export const TransactionList = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await transactionApi.getAll();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

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
                <div style={{ position: 'relative' }}>
                    <Title level={3} style={{ marginBottom: '16px' }}>
                        Giao dịch
                    </Title>

                    {!transactions || transactions.length === 0 ? (
                        <Card>
                            <Text type="secondary">Chưa có giao dịch nào</Text>
                        </Card>
                    ) : (
                        <List
                            dataSource={transactions}
                            renderItem={(item) => (
                                <Card style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text strong>{item.categoryId || 'Giao dịch'}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {formatDate(item.date)}
                                            </Text>
                                            {item.note && (
                                                <>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {item.note}
                                                    </Text>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text
                                                strong
                                                style={{
                                                    color: item.type === 'INCOME' ? '#52c41a' : '#ff4d4f',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                {item.type === 'INCOME' ? '+' : '-'}
                                                {formatCurrency(item.amount)}
                                            </Text>
                                            <br />
                                            <Tag color={item.type === 'INCOME' ? 'green' : 'red'}>
                                                {item.type === 'INCOME' ? 'Thu' : item.type === 'TRANSFER' ? 'Chuyển' : 'Chi'}
                                            </Tag>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        />
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
