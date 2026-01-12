import { analyticsApi } from '@/api/analytics.api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card, Select } from 'antd';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import '../widgets/Widgets.scss';

export const FinancialTrendChart = () => {
    const [period, setPeriod] = useState<'6m' | '12m'>('6m');
    const { data: trendData, isLoading } = useQuery({
        queryKey: ['trendAnalysis', period],
        queryFn: () => analyticsApi.getTrendAnalysis(period),
    });



    return (
        <Card
            title="Xu hướng tài chính"
            extra={
                <Select
                    defaultValue="6m"

                    onChange={(val) => setPeriod(val as any)}
                    options={[
                        { value: '6m', label: '6 tháng' },
                        { value: '12m', label: '1 năm' }
                    ]}
                />
            }
            className="widget-card"
            bordered={false}
            loading={isLoading}
        >
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#8c8c8c' }}
                            tickFormatter={(value) => `${value / 1000000}M`}
                        />
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar
                            dataKey="income"
                            name="Thu nhập"
                            fill="#52c41a"
                            radius={[4, 4, 0, 0]}
                            barSize={12}
                        />
                        <Bar
                            dataKey="expense"
                            name="Chi tiêu"
                            fill="#ff4d4f"
                            radius={[4, 4, 0, 0]}
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
