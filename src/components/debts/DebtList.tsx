import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Segmented, Table, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, LeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/format.utils';
import { useQueryDebts } from '@/queryHooks/debt';
import { DebtData, DebtType } from '@/types/debt.type';
import dayjs from 'dayjs';
import './DebtList.scss';

export const DebtList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<DebtType | 'ALL'>('ALL');
    const pageSize = 10;

    // Pass params directly to the hook
    const { data: response, isLoading: loading } = useQueryDebts({
        page,
        limit: pageSize,
    });

    // Handle different response structures
    const safeResponse = response as any;
    const isV2Response = safeResponse && 'data' in safeResponse && 'meta' in safeResponse;
    const debtListRaw: DebtData[] = isV2Response ? safeResponse.data : (Array.isArray(safeResponse) ? safeResponse : []) || [];

    // Client-side filtering if backend doesn't filter by type automatically yet
    const debtList = debtListRaw.filter(d => filterType === 'ALL' || d.type === filterType);

    // Calculate Total Amount
    const totalAmount = debtList.reduce((sum, item) => sum + item.remainingAmount, 0);

    const handleDebtClick = (id: string) => {
        navigate({ to: `/debts/${id}` });
    };

    const columns: ColumnsType<DebtData> = [
        {
            title: 'Khoản nợ',
            key: 'info',
            className: 'col-info-cell',
            render: (_, record) => (
                <div className="col-info">
                    <div className="partner-name">{record.partnerName}</div>
                    <div className="tags">
                        <Tag color={record.type === DebtType.LOAN ? 'red' : 'green'} className="type-tag" variant="filled">
                            {record.type === DebtType.LOAN ? 'Vay' : 'Cho vay'}
                        </Tag>
                        {record.isInstallment && <Tag color="blue" variant="filled">Trả góp</Tag>}
                    </div>
                    <div className="date-info">
                        {record.isInstallment
                            ? `Hạn ${record.paymentDate} hàng tháng`
                            : dayjs(record.startDate).format('DD/MM/YYYY')
                        }
                    </div>
                </div>
            ),
        },
        {
            title: 'Số tiền & Tiến độ',
            key: 'amount',
            align: 'right',
            className: 'col-amount-cell',
            render: (_, record) => {
                const percentage = record.totalMonths ? Math.round((record.paidMonths || 0) / record.totalMonths * 100) : 0;
                return (
                    <div className="col-amount">
                        <div className={`amount ${record.type === DebtType.LEND ? 'lend' : 'loan'}`}>
                            {formatCurrency(record.remainingAmount)}
                        </div>
                        <div className="total-sub">
                            / {formatCurrency(record.totalAmount)}
                        </div>
                        {record.isInstallment && record.totalMonths && (
                            <div className="progress-wrapper">
                                <Progress
                                    percent={percentage}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#52c41a"
                                    railColor="#f0f0f0"
                                />
                                <div className="progress-text">
                                    {record.paidMonths || 0}/{record.totalMonths} kỳ
                                </div>
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];
    return (

        <div className="debt-list-page">
            {/* SECTION 1: Header */}
            <div className="page-header">
                <div className="custom-header">
                    <div className="icon-btn back-btn" onClick={() => window.history.back()}>
                        <ArrowRightOutlined rotate={180} />
                    </div>
                    <div className="page-title">Quản lý khoản vay</div>
                    <div className="icon-btn add-btn" onClick={() => navigate({ to: '/debts/create' })}>
                        <PlusOutlined />
                    </div>
                </div>
            </div>

            {/* SECTION 2: Summary Filter */}
            <div className="summary-section">
                <div className="total-amount-value">{formatCurrency(totalAmount)}</div>
                <div className="filter-tabs">
                    <Segmented
                        options={[
                            { label: 'Tất cả', value: 'ALL' },
                            { label: 'Tôi vay', value: DebtType.LOAN },
                            { label: 'Cho vay', value: DebtType.LEND },
                        ]}
                        value={filterType}
                        onChange={(value) => {
                            setFilterType(value as DebtType | 'ALL');
                            setPage(1);
                        }}
                        block
                        className="custom-segmented"
                    />
                </div>
            </div>

            {/* SECTION 3: List (Table) */}
            <div className="list-section">
                <div className="table-container">
                    <Table
                        columns={columns}
                        dataSource={debtList}
                        rowKey="_id"
                        loading={loading}
                        scroll={{ y: 400 }}
                        pagination={
                            isV2Response && safeResponse.meta ? {
                                current: page,
                                pageSize: safeResponse.meta.per_page,
                                total: safeResponse.meta.itemCount,
                                onChange: (p) => setPage(p),
                                align: 'center',
                                simple: true,
                                className: 'custom-pagination'
                            } : {
                                pageSize: pageSize,
                                align: 'center',
                                simple: true,
                                className: 'custom-pagination'
                            }
                        }
                        onRow={(record) => ({
                            onClick: () => handleDebtClick(record._id!),
                            style: { cursor: 'pointer' }
                        })}
                        size="small"
                        className="modern-table"
                        showHeader={true}
                    />
                </div>
            </div>
        </div>

    );
};
