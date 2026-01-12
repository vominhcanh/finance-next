import { walletApi } from '@/api/wallet.api';
import { PayStatementPayload, WalletData } from '@/types/wallet.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Button, Drawer, Form, InputNumber, Segmented, Select, message } from 'antd';
import { useEffect } from 'react';
import './PayStatementModal.scss';

interface PayStatementModalProps {
    open: boolean;
    onClose: () => void;
    wallet: WalletData | null;
    wallets: WalletData[];
    onSuccess?: () => void;
}

export const PayStatementModal = ({ open, onClose, wallet, wallets, onSuccess }: PayStatementModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const action = Form.useWatch('action', form);
    const amount = Form.useWatch('amount', form);
    const refinanceFeeRate = Form.useWatch('refinanceFeeRate', form);

    const calculatedFee = (amount || 0) * (refinanceFeeRate || 0) / 100;

    useEffect(() => {
        if (open && wallet) {
            // Calculate outstanding debt for Credit Card: Limit - Available Balance
            const debt = (wallet.creditLimit || 0) - wallet.balance;

            form.setFieldsValue({
                action: 'PAY_FULL',
                amount: debt > 0 ? debt : 0,
                // Default source wallet to first DEBIT_CARD or BANK, distinct from current
                sourceWalletId: wallets.find(w => w._id !== wallet._id && (w.type === 'DEBIT_CARD' || w.type === 'BANK'))?._id
            });
        }
    }, [open, wallet, wallets, form]);

    const mutation = useMutation({
        mutationFn: (payload: PayStatementPayload) => walletApi.payStatement(wallet!._id, payload),
        onSuccess: () => {
            message.success('Thanh toán sao kê thành công');
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            onSuccess?.();
            onClose();
        },
        onError: () => {
            message.error('Thanh toán thất bại');
        }
    });

    const onFinish = (values: any) => {
        if (!wallet) return;
        mutation.mutate({
            action: values.action,
            sourceWalletId: values.sourceWalletId,
            amount: values.amount,
            refinanceFeeRate: values.refinanceFeeRate
        });
    };

    return (
        <Drawer
            title={`Thanh toán sao kê: ${wallet?.name}`}
            open={open}
            onClose={onClose}
            placement="bottom"
            rootClassName="pay-statement-drawer"
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="action" label="Hình thức thanh toán" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                    <Segmented
                        block
                        className="payment-type-segmented"
                        options={[
                            { label: 'Thanh toán toàn bộ', value: 'PAY_FULL' },
                            { label: 'Đáo hạn/Trả một phần', value: 'REFINANCE' }
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="sourceWalletId"
                    label="Nguồn tiền"
                    rules={[{ required: true, message: 'Vui lòng chọn nguồn tiền' }]}
                    style={{ marginBottom: 16 }}
                >
                    <Select placeholder="Chọn ví thanh toán" size="large">
                        {wallets.filter(w => w._id !== wallet?._id).map(w => (
                            <Select.Option key={w._id} value={w._id}>
                                {w.name} ({formatCurrency(w.balance)})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Số tiền thanh toán"
                    rules={[{ required: true, message: 'Nhập số tiền' }]}
                    style={{ marginBottom: 16 }}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="0"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                        suffix="VND"
                    />
                </Form.Item>

                {action === 'REFINANCE' && (
                    <>
                        <Form.Item
                            name="refinanceFeeRate"
                            label="Phí đáo hạn (%)"
                            rules={[{ required: true, message: 'Nhập % phí' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <InputNumber size="large" style={{ width: '100%' }} min={0} max={100} step={0.1} placeholder="Ví dụ: 1.8" />
                        </Form.Item>

                        <div className="refinance-info-box">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: '#d48806' }}>Phí đáo hạn dự kiến:</span>
                                <span style={{ fontWeight: 700, color: '#d48806', fontSize: 16 }}>
                                    {formatCurrency((amount || 0) * (refinanceFeeRate || 0) / 100)}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#d46b08', fontStyle: 'italic' }}>
                                * Gốc giữ nguyên, chỉ trả phí dịch vụ này.
                            </div>
                        </div>
                    </>
                )}

                <Button type="primary" htmlType="submit" size="large" block loading={mutation.isPending} style={{ marginTop: 8 }}>
                    Xác nhận thanh toán
                </Button>
            </Form>
        </Drawer>
    );
};
