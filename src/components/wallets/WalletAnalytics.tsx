import { analyticsApi, CardSummaryItem } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import { Empty, SpinLoading } from 'antd-mobile';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export const WalletAnalytics = ({ activeWalletId }: { activeWalletId?: string | null }) => {
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<CardSummaryItem[]>([]);
    const [historyData, setHistoryData] = useState<Record<string, unknown>[]>([]);

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        if (activeWalletId) {
            fetchHistory(activeWalletId);
        }
    }, [activeWalletId]);

    const fetchSummary = async () => {
        try {
            const data = await analyticsApi.getCardsSummary();
            setSummaryData(data);
        } catch (error) {
            console.error('Failed to fetch wallet analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (walletId: string) => {
        try {
            const data = await analyticsApi.getMonthlyTransactions(undefined, walletId);
            const formattedData = data.map(item => ({
                ...item,
                displayDate: item.date ? item.date.split('T')[0].split('-')[2] : item.day
            }));
            setHistoryData(formattedData);
        } catch (error) {
            console.error('Failed to fetch wallet history:', error);
        }
    };

    interface TooltipPayloadEntry {
        name: string;
        value: number;
        color: string;
        payload?: Record<string, unknown>;
    }
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
        if (active && payload && payload.length) {
            if (payload[0].name === 'Thu nhập' || payload[0].name === 'Chi tiêu' || payload[0].name === 'Xu hướng') {
                return (
                    <div style={{ background: 'rgba(0,0,0,0.8)', borderRadius: 8, padding: '8px 12px', color: '#fff', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Ngày {label}</p>
                        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
                            <div key={index} style={{ color: entry.color, fontSize: 13 }}>
                                {entry.name}: <span style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
                            </div>
                        ))}
                    </div>
                );
            }

            const data = payload[0].payload ?? {};
            return (
                <div style={{ background: 'rgba(0,0,0,0.8)', borderRadius: 8, padding: '8px 12px', color: '#fff', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{String(data['name'] || label || data['categoryName'] || '')}</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const activeData = summaryData.find(w => w._id === activeWalletId);
    const showDetail = !!activeWalletId && !!activeData;

    const averageExpense = historyData.length > 0
        ? historyData.reduce((acc: number, curr) => acc + (Number(curr.expense) || 0), 0) / historyData.length
        : 0;

    return (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1f2c33' }}>Thống Kê Chi Tiêu</div>
                    <div style={{ fontSize: 13, color: '#8c98a4', marginTop: 4 }}>
                        {showDetail ? `Biến động tháng này: ${activeData?.walletName}` : 'Tổng chi tiêu theo từng ví'}
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SpinLoading color="primary" />
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {!showDetail ? (
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <BarChart data={summaryData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="walletName"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                                        interval={0}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(10, 85, 235, 0.05)' }}
                                    />
                                    <Bar
                                        dataKey="totalExpense"
                                        fill="var(--adm-color-primary)"
                                        radius={[12, 12, 12, 12]}
                                        barSize={48}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {summaryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.totalExpense > 0 ? 'var(--adm-color-primary)' : '#E5E7EB'}
                                                style={{ transition: 'all 0.3s ease' }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 280, position: 'relative' }}>
                            <ResponsiveContainer>
                                <ComposedChart data={historyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="displayDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        dy={10}
                                        minTickGap={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Bar dataKey="income" name="Thu nhập" fill="#00c853" radius={[4, 4, 0, 0]} barSize={12} />
                                    <Bar dataKey="expense" name="Chi tiêu" fill="#ff4d4f" radius={[4, 4, 0, 0]} barSize={12} />
                                    <ReferenceLine y={averageExpense} stroke="#faad14" strokeDasharray="4 4" label={{ position: 'insideTopRight', value: 'Trung bình', fill: '#faad14', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                            {historyData.length === 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.6)',
                                    backdropFilter: 'blur(2px)',
                                    zIndex: 10,
                                    borderRadius: 12
                                }}>
                                    <Empty
                                        description={<span style={{ color: '#8c8c8c' }}>Hiện tại thẻ này chưa có giao dịch</span>}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
