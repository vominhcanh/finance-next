import { useEffect, useState } from 'react';
import { Card, Spin, Typography, Segmented } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { analyticsApi, CardSummaryItem, CategorySpendingItem } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import './WalletAnalytics.scss';

const { Title, Text } = Typography;

const COLORS = ['#0a55eb', '#00c853', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#f5222d'];

export const WalletAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<CardSummaryItem[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<CardSummaryItem | null>(null);
    const [overviewData, setOverviewData] = useState<any>(null); // Changed from categoryData array
    const [chartMode, setChartMode] = useState<'SUMMARY' | 'DETAIL'>('SUMMARY');

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const data = await analyticsApi.getCardsSummary();
            setSummaryData(data);
            if (data.length > 0) {
            }
        } catch (error) {
            console.error('Failed to fetch wallet analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryDetails = async (walletId: string) => {
        try {
            setLoading(true);
            const data = await analyticsApi.getCategorySpending(walletId);
            setOverviewData(data);
            setChartMode('DETAIL');
        } catch (error) {
            console.error('Failed to fetch category details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBarClick = (data: any) => {
        if (data && data._id) {
            const wallet = summaryData.find(w => w._id === data._id);
            if (wallet) {
                setSelectedWallet(wallet);
                fetchCategoryDetails(wallet._id);
            }
        }
    };

    const handleBackToSummary = () => {
        setChartMode('SUMMARY');
        setSelectedWallet(null);
        setOverviewData(null);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-chart-tooltip">
                    <p className="label">{data.name || label || data.categoryName}</p>
                    <p className="value">{formatCurrency(payload[0].value)}</p>
                    {/* Additional details can be added here if needed */}
                </div>
            );
        }
        return null;
    };

    // Prepare data for Overview Pie Chart
    const pieData = overviewData ? [
        { name: 'Thu Nhập', value: overviewData.totalIncome, fill: '#00c853' },
        { name: 'Chi Tiêu', value: overviewData.totalExpense, fill: '#ff4d4f' }
    ] : [];

    return (
        <div className="wallet-analytics-container">
            <div className="analytics-header">
                <div>
                    <Title level={4} style={{ margin: 0 }}>Thống Kê Chi Tiêu</Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        {chartMode === 'SUMMARY' ? 'Tổng chi tiêu theo từng ví' : `Tổng quan: ${selectedWallet?.walletName}`}
                    </Text>
                </div>
                {chartMode === 'DETAIL' && (
                    <div onClick={handleBackToSummary} style={{ color: '#0a55eb', cursor: 'pointer', fontWeight: 500 }}>
                        Trở lại
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin />
                </div>
            ) : (
                <div className="chart-content">
                    {chartMode === 'SUMMARY' ? (
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
                                        onClick={handleBarClick}
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
                            {summaryData.length === 0 && <div className="empty-text">Chưa có dữ liệu chi tiêu</div>}
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 280, position: 'relative' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={2}
                                        cornerRadius={4}
                                        dataKey="value"
                                        nameKey="name"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="square"
                                        wrapperStyle={{ fontSize: '14px', right: 10 }}
                                        formatter={(value) => <span style={{ color: '#595959', marginLeft: '8px' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text for Donut */}
                            <div className="donut-center-text">
                                <div className="total-label">TỔNG CHI</div>
                                <div className="total-amount">
                                    {formatCurrency(overviewData?.totalExpense || 0)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
