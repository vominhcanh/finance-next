import { analyticsApi, MonthlyTransactionItem } from '@/api/analytics.api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import '../widgets/Widgets.scss';

export const DailyFlowChart = () => {
    const { data: dailyData, isLoading } = useQuery({
        queryKey: ['monthlyTransactions'],
        queryFn: () => analyticsApi.getMonthlyTransactions(),
    });

    // use Card loading instead

    const formattedData = dailyData?.map((item: MonthlyTransactionItem) => ({
        ...item,
        day: dayjs(item.date).format('DD'), // Show only day number
    }));

    return (
        <Card title="Dòng tiền trong tháng" className="widget-card" bordered={false} loading={isLoading}>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#8c8c8c' }}
                            interval={2} // Show fewer labels for cleaner look
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#8c8c8c' }}
                            tickFormatter={(value) => `${value / 1000000}M`}
                        />
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            labelFormatter={(label) => `Ngày ${label}`}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        />
                        <Legend iconType="circle" />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Thu nhập"
                            stroke="#52c41a"
                            strokeWidth={3}
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            name="Chi tiêu"
                            stroke="#ff4d4f"
                            strokeWidth={3}
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
