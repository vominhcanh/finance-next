import { useQueryWallets } from '@/queryHooks/wallet';
import { CategoryType } from '@/types/category.type';
import { TransactionForm as ITransactionForm, TransactionType } from '@/types/transaction.type';
import { CategorySelect } from '@components/common/CategorySelect';
import { Button, DatePicker, Form, Input, NumberKeyboard, Picker, Selector, Space, VirtualInput } from 'antd-mobile';
import dayjs from 'dayjs';
import React, { useEffect, useState, useRef } from 'react';

interface TransactionFormProps {
    onSubmit: (data: ITransactionForm) => void;
    isLoading?: boolean;
    initialValues?: Partial<ITransactionForm>;
}

interface TransactionFormValues extends Omit<ITransactionForm, 'date'> {
    date: Date;
}

const AmountInput = ({ value, onChange, placeholder }: any) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            <VirtualInput
                placeholder={placeholder}
                value={value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                onFocus={() => {
                    setVisible(true);
                }}
                clearable
                onClear={() => onChange?.('')}
            />
            <NumberKeyboard
                visible={visible}
                onClose={() => {
                    setVisible(false);
                }}
                onInput={(v) => {
                    onChange?.((value || '') + v);
                }}
                onDelete={() => {
                    onChange?.((value || '').toString().slice(0, -1));
                }}
            />
        </div>
    );
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, isLoading, initialValues }) => {
    const [form] = Form.useForm();
    const type = Form.useWatch('type', form);
    const { data: wallets } = useQueryWallets();

    const [walletVisible, setWalletVisible] = useState(false);
    const [targetWalletVisible, setTargetWalletVisible] = useState(false);
    const [dateVisible, setDateVisible] = useState(false);

    // Set default date and type
    useEffect(() => {
        form.setFieldsValue({
            date: new Date(),
            type: [TransactionType.EXPENSE],
            ...initialValues,
            // Convert initial type to array for Selector
            ...(initialValues?.type ? { type: [initialValues.type] } : {})
        });
    }, [form, initialValues]);

    const handleFinish = (values: any) => {
        const payload: ITransactionForm = {
            ...values,
            date: dayjs(values.date).toISOString(), // Always use selected time
            amount: Number(values.amount),
            type: values.type[0] || values.type, // Handle Selector array
            walletId: values.walletId?.[0] || values.walletId,
            targetWalletId: values.targetWalletId?.[0] || values.targetWalletId
        };
        onSubmit(payload);
    };

    const walletColumns = wallets ? [wallets.map(w => ({ label: w.name, value: w._id }))] : [];

    const currentType = Array.isArray(type) ? type[0] : type;

    return (
        <Form
            form={form}
            layout="vertical"
            mode="card"
            onFinish={handleFinish}
            initialValues={{ type: [TransactionType.EXPENSE] }}
            footer={
                <Button
                    color="primary"
                    type="submit"
                    loading={isLoading}
                    block
                    size="large"
                    style={{ borderRadius: 8, fontSize: 16, fontWeight: 500 }}
                >
                    Lưu giao dịch
                </Button>
            }
        >
            <Form.Item name="type">
                <Selector
                    options={[
                        { label: 'Chi tiêu', value: TransactionType.EXPENSE },
                        { label: 'Thu nhập', value: TransactionType.INCOME },
                        { label: 'Chuyển khoản', value: TransactionType.TRANSFER },
                    ]}
                    onChange={(val) => {
                        if (val.length === 0) {
                            // Ensure one option is always selected
                            form.setFieldValue('type', [currentType]);
                        }
                    }}
                />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú" rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}>
                <Input
                    placeholder="Ghi chú thêm..."
                    clearable
                />
            </Form.Item>

            <Form.Item
                name="amount"
                label="Số tiền (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
                <AmountInput placeholder="0" />
            </Form.Item>

            {/* Wallet Selection */}
            <Form.Item
                name="walletId"
                label={currentType === TransactionType.TRANSFER ? "Từ ví" : "Ví"}
                rules={[{ required: true, message: 'Vui lòng chọn ví' }]}
                trigger="onConfirm"
                onClick={() => setWalletVisible(true)}
            >
                <Picker
                    columns={walletColumns}
                    visible={walletVisible}
                    onClose={() => setWalletVisible(false)}
                >
                    {items => {
                        if (items.every(item => item === null)) {
                            return 'Chọn ví';
                        }
                        return items.map(item => item?.label ?? 'Unknown').join('');
                    }}
                </Picker>
            </Form.Item>

            <Form.Item 
                name="date" 
                label="Ngày giao dịch" 
                rules={[{ required: true, message: 'Vui lòng chọn ngày giao dịch' }]}
                trigger="onConfirm"
                onClick={() => setDateVisible(true)}
            >
                <DatePicker
                    visible={dateVisible}
                    onClose={() => setDateVisible(false)}
                >
                    {value => value ? dayjs(value).format('DD/MM/YYYY') : 'Chọn ngày'}
                </DatePicker>
            </Form.Item>

            {currentType === TransactionType.TRANSFER ? (
                <Form.Item
                    name="targetWalletId"
                    label="Đến ví"
                    rules={[
                        { required: true, message: 'Vui lòng chọn ví đích' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const sourceWallet = getFieldValue('walletId')?.[0] || getFieldValue('walletId');
                                const targetWallet = value?.[0] || value;
                                if (!targetWallet || sourceWallet !== targetWallet) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Ví đích không được trùng ví nguồn'));
                            },
                        }),
                    ]}
                    trigger="onConfirm"
                    onClick={() => setTargetWalletVisible(true)}
                >
                    <Picker
                        columns={walletColumns}
                        visible={targetWalletVisible}
                        onClose={() => setTargetWalletVisible(false)}
                    >
                        {items => {
                            if (items.every(item => item === null)) {
                                return 'Chọn ví đích';
                            }
                            return items.map(item => item?.label ?? 'Unknown').join('');
                        }}
                    </Picker>
                </Form.Item>
            ) : (
                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                    {/* Assuming CategorySelect is still compatible or mapped. 
                        We will update CategorySelect later to be a Picker. */}
                    <CategorySelect
                        type={currentType === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE}
                        placeholder="Chọn danh mục"
                    />
                </Form.Item>
            )}
        </Form>
    );
};
