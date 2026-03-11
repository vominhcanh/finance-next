import { useQueryCategories } from '@/queryHooks/useCategory';
import { useMutateTransaction, useQueryTransactions } from '@/queryHooks/useTransaction';
import { CategoryData } from '@/types/category.type';
import { TransactionData, TransactionType } from '@/types/transaction.type';
import { ArrowRightOutlined, DeleteOutlined, EditOutlined, FilterOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/format.utils';
import { ActionSheet, Button, Empty, Grid, List, Popup, Space, SwipeAction } from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { TransactionForm } from './TransactionForm';

export const TransactionList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { data: response, isLoading } = useQueryTransactions();
    const { data: categoryResponse } = useQueryCategories();
    const { create } = useMutateTransaction();

    const transactions = response?.data || [];
    const categories: CategoryData[] = categoryResponse || [];
    const categoryMap = useMemo(() => {
        const map: Record<string, string> = {};
        categories.forEach((c: CategoryData) => {
            map[c._id] = c.name;
        });
        return map;
    }, [categories]);

    const { totalIncome, totalExpense } = useMemo(() => {
        return transactions.reduce((acc: any, curr: any) => {
            if (curr.type === TransactionType.INCOME) acc.totalIncome += curr.amount;
            if (curr.type === TransactionType.EXPENSE) acc.totalExpense += curr.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, TransactionData[]> = {};
        let filtered = transactions.filter((t: any) =>
            t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.categoryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.amount + '').includes(searchTerm)
        );

        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter((t: any) => t.categoryId === selectedCategory);
        }

        filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        filtered.forEach((t: any) => {
            const dateKey = dayjs(t.date).format('DD MMMM YYYY');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push({
                ...t,
                categoryName: categoryMap[t.categoryId]
            } as any);
        });

        return groups;
    }, [transactions, searchTerm, categoryMap, selectedCategory]);

    const renderIcon = (type: TransactionType) => {
        if (type === TransactionType.TRANSFER) return <ArrowRightOutlined style={{ color: '#007AFF' }} />;
        if (type === TransactionType.INCOME) return <ArrowRightOutlined rotate={-45} style={{ color: '#00C48C' }} />;
        return <ShoppingOutlined style={{ color: '#FF647C' }} />;
    };

    const swipeActions = (item: any) => [
        {
            key: 'edit',
            text: <EditOutlined />,
            color: 'primary',
            onClick: () => console.log('Edit', item)
        },
        {
            key: 'delete',
            text: <DeleteOutlined />,
            color: 'danger',
            onClick: () => console.log('Delete', item)
        },
    ];

    return (
        <Space direction="vertical" block style={{ '--gap': '16px' }}>
            {/* Section 1: Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2c33' }}>Giao dịch</div>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsDrawerOpen(true)}>
                    <FilterOutlined />
                </div>
            </div>

            {/* Section 2: Summary */}
            <Grid columns={2} gap={16}>
                <Grid.Item>
                    <div style={{ background: '#faf9f9', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#8C98A4', fontWeight: 600 }}>Tổng thu</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#00c452' }}>+ {formatCurrency(totalIncome)}</span>
                    </div>
                </Grid.Item>
                <Grid.Item>
                    <div style={{ background: '#faf9f9', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#8C98A4', fontWeight: 600 }}>Tổng chi</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#FF647C' }}>- {formatCurrency(totalExpense)}</span>
                    </div>
                </Grid.Item>
            </Grid>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        padding: '10px 20px',
                        borderRadius: 18,
                        background: selectedCategory === 'ALL' ? 'var(--adm-color-primary)' : '#f5f5f5',
                        color: selectedCategory === 'ALL' ? '#fff' : '#8C98A4',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedCategory('ALL')}
                >
                    Tất cả
                </div>
                {categories.map((cat: CategoryData) => (
                    <div
                        key={cat._id}
                        style={{
                            whiteSpace: 'nowrap',
                            padding: '10px 20px',
                            borderRadius: 18,
                            background: selectedCategory === cat._id ? 'var(--adm-color-primary)' : '#f5f5f5',
                            color: selectedCategory === cat._id ? '#fff' : '#8C98A4',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                        onClick={() => setSelectedCategory(cat._id)}
                    >
                        {cat.name}
                    </div>
                ))}
            </div>

            {/* Section 3: List */}
            <div>
                {Object.keys(groupedTransactions).length === 0 ? (
                    <Empty description="Không có giao dịch" style={{ marginTop: 50 }} />
                ) : (
                    Object.keys(groupedTransactions).map((date) => (
                        <div key={date} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, padding: '0 10px', margin: '16px 0', fontWeight: 400, color: '#4b4c4d' }}>
                                {date === dayjs().format('DD MMMM YYYY') ? 'Hôm nay' : dayjs(date).format('DD/MM/YYYY')}
                            </div>
                            <List style={{ '--border-top': 'none', '--border-bottom': 'none', '--border-inner': 'none' }}>
                                {groupedTransactions[date].map((item: any) => (
                                    <SwipeAction key={item._id} rightActions={swipeActions(item) as any}>
                                        <List.Item
                                            prefix={
                                                <div style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 20,
                                                    background: item.type === TransactionType.INCOME ? 'rgba(0, 196, 140, 0.1)' : 'rgba(255, 100, 124, 0.1)'
                                                }}>
                                                    {renderIcon(item.type)}
                                                </div>
                                            }
                                            description={dayjs(item.date).format('HH:mm:ss')}
                                            extra={
                                                <div style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: item.type === TransactionType.INCOME ? '#00C48C' : '#FF647C'
                                                }}>
                                                    {item.type === TransactionType.INCOME ? '+' : '-'}
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            }
                                            style={{ background: '#faf9f9', borderRadius: 10, marginBottom: 8 }}
                                        >
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2c33' }}>
                                                {item.note || item.categoryName || 'Không có ghi chú'}
                                            </div>
                                        </List.Item>
                                    </SwipeAction>
                                ))}
                            </List>
                        </div>
                    ))
                )}
            </div>

            <Popup
                visible={isDrawerOpen}
                onMaskClick={() => setIsDrawerOpen(false)}
                bodyStyle={{ height: '85vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
                <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                        Tạo giao dịch mới
                    </div>
                    <TransactionForm
                        onSubmit={(data) => {
                            create.mutate(data, {
                                onSuccess: () => setIsDrawerOpen(false)
                            });
                        }}
                        isLoading={create.isPending}
                    />
                </div>
            </Popup>
        </Space>
    );
};
