import { useQueryDebts } from '@/queryHooks/debt';
import { DebtData, DebtType } from '@/types/debt.type';
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { formatCurrency } from '@utils/format.utils';
import { InfiniteScroll, List, ProgressBar, Selector, Space, Tag } from 'antd-mobile';
import dayjs from 'dayjs';
import { useState } from 'react';

export const DebtList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<DebtType | 'ALL'>('ALL');
    const pageSize = 10;

    const { data: response, isLoading: loading } = useQueryDebts({
        page,
        limit: pageSize,
    });

    const safeResponse = response as any;
    const isV2Response = safeResponse && 'data' in safeResponse && 'meta' in safeResponse;
    const debtListRaw: DebtData[] = isV2Response ? safeResponse.data : (Array.isArray(safeResponse) ? safeResponse : []) || [];
    const hasMore = isV2Response ? page < safeResponse.meta.pageCount : false;

    const debtList = debtListRaw.filter(d => filterType === 'ALL' || d.type === filterType);

    const totalAmount = debtList.reduce((sum, item) => sum + item.remainingAmount, 0);

    const handleDebtClick = (id: string) => {
        navigate({ to: `/debts/${id}` });
    };

    const loadMore = async () => {
        if (!loading && hasMore) {
            setPage(p => p + 1);
        }
    };

    return (
        <Space direction="vertical" block style={{ padding: 12, paddingBottom: 150, background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2c33' }}>Quản lý khoản vay</div>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate({ to: '/debts/create' })}>
                    <PlusOutlined />
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--adm-color-primary)', marginBottom: 16, textAlign: 'center' }}>
                    {formatCurrency(totalAmount)}
                </div>
                <Selector
                    columns={3}
                    options={[
                        { label: 'Tất cả', value: 'ALL' },
                        { label: 'Tôi vay', value: DebtType.LOAN },
                        { label: 'Cho vay', value: DebtType.LEND },
                    ]}
                    value={[filterType]}
                    onChange={(v) => { if (v.length) { setFilterType(v[0] as DebtType | 'ALL'); setPage(1); } }}
                    style={{ '--border-radius': '8px' }}
                />
            </div>

            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
                    {debtList.map(record => {
                        const percentage = record.totalMonths ? Math.round((record.paidMonths || 0) / record.totalMonths * 100) : 0;
                        return (
                            <List.Item
                                key={record._id}
                                onClick={() => handleDebtClick(record._id!)}
                                style={{ borderBottom: '1px solid #f0f0f0' }}
                                extra={
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: record.type === DebtType.LEND ? '#52c41a' : '#ff4d4f', marginBottom: 4 }}>
                                            {formatCurrency(record.remainingAmount)}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>
                                            / {formatCurrency(record.totalAmount)}
                                        </div>
                                        {record.isInstallment && record.totalMonths && (
                                            <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <ProgressBar percent={percentage} style={{ '--track-width': '4px', '--fill-color': '#52c41a' }} />
                                                <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>
                                                    {record.paidMonths || 0}/{record.totalMonths} kỳ
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                }
                            >
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2c33', marginBottom: 6 }}>
                                    {record.partnerName}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                    <Tag color={record.type === DebtType.LOAN ? 'danger' : 'success'} fill='outline'>
                                        {record.type === DebtType.LOAN ? 'Vay' : 'Cho vay'}
                                    </Tag>
                                    {record.isInstallment && <Tag color="primary" fill='outline'>Trả góp</Tag>}
                                </div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                    {record.isInstallment
                                        ? `Hạn ${record.paymentDate} hàng tháng`
                                        : dayjs(record.startDate).format('DD/MM/YYYY')}
                                </div>
                            </List.Item>
                        );
                    })}
                </List>
                <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
            </div>
        </Space>
    );
};
