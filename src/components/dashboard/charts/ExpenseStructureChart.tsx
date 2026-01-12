import { analyticsApi } from '@/api/analytics.api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card } from 'antd';
import { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import '../widgets/Widgets.scss';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0d911', '#eb2f96', '#722ed1', '#faad14'];

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={-4} textAnchor="middle" fill={fill} style={{ fontSize: '14px', fontWeight: 600 }}>
                {payload.categoryName}
            </text>
            <text x={cx} y={cy} dy={16} textAnchor="middle" fill="#999" style={{ fontSize: '12px' }}>
                {`${(percent * 100).toFixed(1)}%`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={6}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 12}
                outerRadius={outerRadius + 18}
                fill={fill}
            />
        </g>
    );
};

export const ExpenseStructureChart = () => {
    const { data: categoryData, isLoading } = useQuery({
        queryKey: ['categoryBreakdown'],
        queryFn: () => analyticsApi.getCategoryBreakdown(),
    });

    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    if (isLoading) {
        // use Card loading instead
    }

    const chartData = categoryData || [];
    const totalExpense = chartData.reduce((sum, item) => sum + item.totalAmount, 0);

    return (
        <Card title="Cơ cấu chi tiêu" className="widget-card" bordered={false} loading={isLoading}>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            // @ts-ignore
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData as any}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="totalAmount"
                            nameKey="categoryName"
                            onMouseEnter={onPieEnter}
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend
                            iconType="circle"
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {chartData.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: -20, color: '#8c8c8c', fontSize: '12px' }}>
                    Tổng chi tiêu: <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{formatCurrency(totalExpense)}</span>
                </div>
            )}
        </Card>
    );
};
