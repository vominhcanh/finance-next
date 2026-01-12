import { analyticsApi, CardSummaryItem } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import { Empty, Spin, Typography } from 'antd';
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
import './WalletAnalytics.scss';

const { Title, Text } = Typography;


export const WalletAnalytics = ({ activeWalletId }: { activeWalletId?: string | null }) => {
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<CardSummaryItem[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);

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
            // Format dates for display
            const formattedData = data.map(item => ({
                ...item,
                displayDate: item.date ? item.date.split('T')[0].split('-')[2] : item.day // Extract day
            }));
            setHistoryData(formattedData);
        } catch (error) {
            console.error('Failed to fetch wallet history:', error);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // For ComposedChart, payload is array of items
            // For BarChart (Summary), payload[0].payload has data

            // Check if it's history data (has income/expense)
            if (payload[0].name === 'Thu nhập' || payload[0].name === 'Chi tiêu' || payload[0].name === 'Xu hướng') {
                return (
                    <div className="custom-chart-tooltip">
                        <p className="label">Ngày {label}</p>
                        {payload.map((entry: any, index: number) => (
                            <div key={index} style={{ color: entry.color, fontSize: 13 }}>
                                {entry.name}: <span style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
                            </div>
                        ))}
                    </div>
                );
            }

            // Fallback for Summary BarChart
            const data = payload[0].payload;
            return (
                <div className="custom-chart-tooltip">
                    <p className="label">{data.name || label || data.categoryName}</p>
                    <p className="value">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const activeData = summaryData.find(w => w._id === activeWalletId);
    const showDetail = !!activeWalletId && !!activeData;

    // Calculate Average Expense
    const averageExpense = historyData.length > 0
        ? historyData.reduce((acc, curr) => acc + (curr.expense || 0), 0) / historyData.length
        : 0;

    return (
        <div className="wallet-analytics-container">
            <div className="analytics-header">
                <div>
                    <Title level={4} style={{ margin: 0 }}>Thống Kê Chi Tiêu</Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        {showDetail ? `Biến động tháng này: ${activeData?.walletName}` : 'Tổng chi tiêu theo từng ví'}
                    </Text>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin />
                </div>
            ) : (
                <div className="chart-content">
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
                                        fill="#0a55eb"
                                        radius={[12, 12, 12, 12]}
                                        barSize={48}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {summaryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.totalExpense > 0 ? '#0a55eb' : '#E5E7EB'}
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
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
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
