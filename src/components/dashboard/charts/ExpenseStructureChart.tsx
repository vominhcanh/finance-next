import { analyticsApi } from '@/api/analytics.api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card } from 'antd';
import { useMemo } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import '../widgets/Widgets.scss';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0d911', '#eb2f96', '#722ed1', '#faad14'];

export const ExpenseStructureChart = () => {
    const { data: categoryData, isLoading } = useQuery({
        queryKey: ['categoryBreakdown'],
        queryFn: () => analyticsApi.getCategoryBreakdown(),
    });

    const processedData = useMemo(() => {
        if (!categoryData) return [];

        // 1. Sort descending by amount
        const sorted = [...categoryData].sort((a, b) => b.totalAmount - a.totalAmount);

        // 2. Calculate cumulative percentage for Pareto Line
        const total = sorted.reduce((sum, item) => sum + item.totalAmount, 0);
        let currentSum = 0;

        return sorted.map(item => {
            currentSum += item.totalAmount;
            return {
                ...item,
                cumulativePercentage: Math.round((currentSum / total) * 100),
                percentage: (item.totalAmount / total) * 100
            };
        });
    }, [categoryData]);

    const totalExpense = useMemo(() => {
        return (categoryData || []).reduce((sum: number, item: any) => sum + item.totalAmount, 0);
    }, [categoryData]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', padding: '12px', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>{label}</p>
                    <p style={{ color: '#8884d8', margin: 0 }}>
                        Chi tiêu: <strong>{formatCurrency(payload[0].value)}</strong>
                    </p>
                    <p style={{ color: '#ff7300', margin: 0, fontSize: 13 }}>
                        Tích lũy: {payload[1]?.value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card title="Cơ cấu chi tiêu" className="widget-card" bordered={false} loading={isLoading}>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={processedData}
                        margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
                    >
                        <CartesianGrid stroke="#f5f5f5" vertical={false} />
                        <XAxis
                            dataKey="categoryName"
                            scale="band"
                            tick={{ fontSize: 12, fill: '#8c8c8c' }}
                            interval={0}
                            angle={0}
                            tickMargin={10}
                            tickFormatter={(val) => val.length > 12 ? `${val.slice(0, 10)}...` : val}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(value) => `${value / 1000000}M`}
                            tick={{ fontSize: 12, fill: '#8c8c8c' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value}%`}
                            tick={{ fontSize: 12, fill: '#8c8c8c' }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Bar yAxisId="left" dataKey="totalAmount" barSize={48} radius={[6, 6, 0, 0]}>
                            {processedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>

                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="cumulativePercentage"
                            stroke="#ff7300"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#ff7300', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            {processedData.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 24, color: '#8c8c8c', fontSize: '12px' }}>
                    Tổng chi tiêu: <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{formatCurrency(totalExpense)}</span>
                </div>
            )}
        </Card>
    );
};
