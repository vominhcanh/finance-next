import { useMutateDebt } from '@/queryHooks/debt';
import { useQueryWallets } from '@/queryHooks/wallet';
import { formatCurrency } from '@utils/format.utils';
import { Button, Form, Picker, Popup } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PayInstallmentModalProps {
    open: boolean;
    onClose: () => void;
    data: {
        debtId?: string;
        installmentId: string;
        amount: number;
        dueDate: string;
        installmentDisplay?: string;
        name?: string;
    } | null;
    onSuccess?: () => void;
}

export const PayInstallmentModal = ({ open, onClose, data, onSuccess }: PayInstallmentModalProps) => {
    const [form] = Form.useForm();
    const { data: wallets } = useQueryWallets();
    const { payInstallment } = useMutateDebt();

    const [pickerVisible, setPickerVisible] = useState(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleOk = (values: any) => {
        if (!data) return;

        payInstallment.mutate(
            {
                installmentId: data.installmentId,
                walletId: values.walletId?.[0] || values.walletId
            },
            {
                onSuccess: () => {
                    toast.success('Thanh toán kỳ trả góp thành công');
                    onSuccess?.();
                    onClose();
                },
                onError: () => {
                    toast.error('Thanh toán thất bại');
                }
            }
        );
    };

    const walletColumns = [[
        ...(wallets || []).map((w: any) => ({
            label: `${w.name} (${formatCurrency(w.balance)})`,
            value: w._id
        }))
    ]];

    return (
        <Popup
            visible={open}
            onMaskClick={onClose}
            bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: '40vh' }}
        >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                Thanh toán kỳ trả góp
            </div>
            {data && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#8c8c8c' }}>Khoản vay:</span>
                            <span style={{ fontWeight: 600 }}>{data.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#8c8c8c' }}>Kỳ hạn:</span>
                            <span>{data.installmentDisplay}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Số tiền:</span>
                            <span style={{ fontWeight: 700, color: '#faad14', fontSize: 16 }}>
                                {formatCurrency(data.amount)}
                            </span>
                        </div>
                    </div>

                    <Form 
                        form={form} 
                        layout="vertical"
                        onFinish={handleOk}
                        footer={
                            <Button color="primary" type="submit" block size="large" loading={payInstallment.isPending} style={{ borderRadius: 8 }}>
                                Xác nhận
                            </Button>
                        }
                    >
                        <Form.Item
                            name="walletId"
                            label="Nguồn tiền thanh toán"
                            rules={[{ required: true, message: 'Vui lòng chọn ví' }]}
                            trigger="onConfirm"
                            onClick={() => setPickerVisible(true)}
                        >
                            <Picker
                                columns={walletColumns}
                                visible={pickerVisible}
                                onClose={() => setPickerVisible(false)}
                            >
                                {items => items.every(item => item === null) ? 'Chọn ví thanh toán' : items.map(item => item?.label).join('')}
                            </Picker>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Popup>
    );
};
