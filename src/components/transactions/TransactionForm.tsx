
import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Segmented, Button, Row, Col } from 'antd';
import { CategorySelect } from '@components/common/CategorySelect';
import { useQueryWallets } from '@/queryHooks/wallet';
import { TransactionType, TransactionForm as ITransactionForm } from '@/types/transaction.type';
import { CategoryType } from '@/types/category.type';
import dayjs from 'dayjs';
import './TransactionForm.scss';

interface TransactionFormProps {
    onSubmit: (data: ITransactionForm) => void;
    isLoading?: boolean;
    initialValues?: Partial<ITransactionForm>;
}

interface TransactionFormValues extends Omit<ITransactionForm, 'date'> {
    date: dayjs.Dayjs;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, isLoading, initialValues }) => {
    const [form] = Form.useForm();
    const type = Form.useWatch('type', form);
    const { data: wallets } = useQueryWallets();

    // Set default date and type
    useEffect(() => {
        form.setFieldsValue({
            date: dayjs(),
            type: TransactionType.EXPENSE,
            ...initialValues
        });
    }, [form, initialValues]);

    const handleFinish = (values: TransactionFormValues) => {
        const payload: ITransactionForm = {
            ...values,
            ...values,
            date: dayjs().toISOString(), // Always use current time on submit
            amount: Number(values.amount)
        };
        onSubmit(payload);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ type: TransactionType.EXPENSE }}
            className="transaction-form-container"
        >
            <Form.Item name="type" hidden>
                <Input />
            </Form.Item>

            <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Segmented
                    value={type}
                    onChange={(val) => form.setFieldValue('type', val)}
                    options={[
                        { label: 'Chi tiêu', value: TransactionType.EXPENSE },
                        { label: 'Thu nhập', value: TransactionType.INCOME },
                        { label: 'Chuyển khoản', value: TransactionType.TRANSFER },
                    ]}
                    block
                    size="middle"
                />
            </div>

            <Form.Item
                name="amount"
                label="Số tiền"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                    size="small"
                    suffix="VND"
                />
            </Form.Item>

            {/* Wallet Selection */}
            <Form.Item
                name="walletId"
                label={type === TransactionType.TRANSFER ? "Từ ví" : "Ví"}
                rules={[{ required: true, message: 'Vui lòng chọn ví' }]}
            >
                <Select placeholder="Chọn ví" size="small">
                    {wallets?.map(w => (
                        <Select.Option key={w._id} value={w._id}>{w.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="date" hidden>
                <DatePicker />
            </Form.Item>

            {type === TransactionType.TRANSFER ? (
                <Form.Item
                    name="targetWalletId"
                    label="Đến ví"
                    rules={[
                        { required: true, message: 'Vui lòng chọn ví đích' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('walletId') !== value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Ví đích không được trùng ví nguồn'));
                            },
                        }),
                    ]}
                >
                    <Select placeholder="Chọn ví đích" size="small">
                        {wallets?.map(w => (
                            <Select.Option key={w._id} value={w._id}>{w.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            ) : (
                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                    <CategorySelect

                        type={type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE}
                        placeholder="Chọn danh mục"
                    />
                </Form.Item>
            )}

            <Form.Item name="note" label="Ghi chú">
                <Input.TextArea
                    rows={3}
                    placeholder="Ghi chú thêm..."
                />
            </Form.Item>

            <Form.Item style={{ marginTop: 12 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    size="large"
                    style={{ height: 48, borderRadius: 8, fontSize: 16, fontWeight: 500 }}
                >
                    Lưu giao dịch
                </Button>
            </Form.Item>
        </Form>
    );
};
