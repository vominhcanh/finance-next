import { useEffect, useState } from 'react';
import { Spin, DatePicker } from 'antd';
import {
    ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area
} from 'recharts';
import { analyticsApi, MonthlyTransactionItem } from '@api/analytics.api';
import { formatCurrency } from '@utils/format.utils';
import dayjs, { Dayjs } from 'dayjs';
import './DashboardAnalytics.scss';

export const DashboardAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MonthlyTransactionItem[]>([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0 });
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

    useEffect(() => {
        fetchData(selectedMonth.format('MM-YYYY'));
    }, [selectedMonth]);

    const fetchData = async (monthStr: string) => {
        try {
            setLoading(true);
            const resp = await analyticsApi.getMonthlyTransactions(monthStr);
            setData(resp);

            const income = resp.reduce((sum, item) => sum + item.income, 0);
            const expense = resp.reduce((sum, item) => sum + item.expense, 0);
            setSummary({ income, expense });
        } catch (error) {
            console.error('Failed to fetch monthly analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (date: Dayjs | null) => {
        if (date) {
            setSelectedMonth(date);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="analytics-tooltip">
                    <div className="tooltip-date">Ngày {label}</div>
                    <div className="tooltip-row income">
                        <span>Thu:</span>
                        <span>{formatCurrency(payload.find((p: any) => p.dataKey === 'income')?.value || 0)}</span>
                    </div>
                    <div className="tooltip-row expense">
                        <span>Chi:</span>
                        <span>{formatCurrency(payload.find((p: any) => p.dataKey === 'expense')?.value || 0)}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-analytics-container">
            <div className="analytics-header">
                <h3>Thống Kê Thu Chi</h3>
                <DatePicker
                    picker="month"
                    format="MM/YYYY"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    allowClear={false}
                    size='small'
                    className="month-picker"
                    popupClassName="small-month-picker-dropdown"
                />
            </div>

            <div className="summary-cards">
                <div className="summary-card income">
                    <span className="label">Tổng Thu</span>
                    <span className="value">{formatCurrency(summary.income)}</span>
                </div>
                <div className="summary-card expense">
                    <span className="label">Tổng Chi</span>
                    <span className="value">{formatCurrency(summary.expense)}</span>
                </div>
            </div>

            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00c853" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00c853" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            interval={4}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        <Area type="monotone" dataKey="income" stroke="none" fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="none" fill="url(#colorExpense)" />

                        <Line type="monotone" dataKey="income" stroke="#00c853" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="expense" stroke="#ff4d4f" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
