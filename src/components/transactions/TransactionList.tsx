
import { useQueryCategories } from '@/queryHooks/useCategory';
import { useMutateTransaction, useQueryTransactions } from '@/queryHooks/useTransaction';
import { CategoryData } from '@/types/category.type';
import { TransactionData, TransactionType } from '@/types/transaction.type';
import { ArrowRightOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/format.utils';
import { Drawer, Empty } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { TransactionForm } from './TransactionForm';
import './TransactionList.scss';

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
        return transactions.reduce((acc, curr) => {
            if (curr.type === TransactionType.INCOME) acc.totalIncome += curr.amount;
            if (curr.type === TransactionType.EXPENSE) acc.totalExpense += curr.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, TransactionData[]> = {};
        let filtered = transactions.filter(t =>
            t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.categoryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.amount + '').includes(searchTerm)
        );

        // Apply Category Filter
        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(t => t.categoryId === selectedCategory);
        }

        // Sort by Date Descending
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        filtered.forEach((t) => {
            const dateKey = dayjs(t.date).format('DD MMMM YYYY');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            // Map category name if available
            groups[dateKey].push({
                ...t,
                categoryName: categoryMap[t.categoryId]
            });
        });

        return groups;
    }, [transactions, searchTerm, categoryMap, selectedCategory]);

    const renderIcon = (type: TransactionType) => {
        // You might want to map specific categories to specific icons here later
        if (type === TransactionType.TRANSFER) return <ArrowRightOutlined style={{ color: '#007AFF' }} />;
        if (type === TransactionType.INCOME) return <ArrowRightOutlined rotate={-45} style={{ color: '#00C48C' }} />;
        return <ShoppingOutlined style={{ color: '#FF647C' }} />;
    };

    return (
        <div className="transaction-list-container">
            {/* Section 1: Header */}
            <div className="custom-header">
                <div className="icon-btn back-btn" onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div className="page-title">Giao dịch</div>
                <div className="icon-btn add-btn" onClick={() => setIsDrawerOpen(true)}>
                    <PlusOutlined />
                </div>
            </div>

            {/* Section 2: Summary & Filters */}
            <div className="summary-section">
                <div className="summary-cards">
                    <div className="summary-card income">
                        <span className="label">Tổng thu</span>
                        <span className="value">+ {formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="summary-card expense">
                        <span className="label">Tổng chi</span>
                        <span className="value">- {formatCurrency(totalExpense)}</span>
                    </div>
                </div>

                <div className="category-filter">
                    <div
                        className={`filter-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        Tất cả
                    </div>
                    {categories.map((cat: CategoryData) => (
                        <div
                            key={cat._id}
                            className={`filter-pill ${selectedCategory === cat._id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat._id)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 3: List */}
            <div className="list-section">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có giao dịch" style={{ marginTop: 50 }} />
                ) : (
                    Object.keys(groupedTransactions).map((date) => (
                        <div key={date} className="date-group">
                            <div className="date-header">{date === dayjs().format('DD MMMM YYYY') ? 'Hôm nay' : dayjs(date).format('DD/MM/YYYY')}</div>
                            <div className="transaction-items">
                                {groupedTransactions[date].map((item) => (
                                    <div key={item._id} className="transaction-card">
                                        <div className="card-left">
                                            <div className={`icon-wrapper ${item.type.toLowerCase()}`}>
                                                {renderIcon(item.type)}
                                            </div>
                                            <div className="info">
                                                <span className="category-name">
                                                    {item.note}
                                                </span>
                                                <span className="time">
                                                    {dayjs(item.date).format('DD-MM-YYYY HH:mm:ss')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-right">
                                            <span className={`amount ${item.type === TransactionType.INCOME ? 'income' : 'expense'}`}>
                                                {item.type === TransactionType.INCOME ? '+' : '-'}
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Drawer
                title="Tạo giao dịch mới"
                placement="bottom"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                height="auto"
                styles={{ body: { paddingBottom: 40 } }}
            >
                <TransactionForm
                    onSubmit={(data) => {
                        create.mutate(data, {
                            onSuccess: () => {
                                setIsDrawerOpen(false);
                            }
                        });
                    }}
                    isLoading={create.isPending}
                />
            </Drawer>
        </div >
    );
};
