import { walletApi } from '@/api/wallet.api';
import { PayStatementPayload, WalletData } from '@/types/wallet.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@utils/format.utils';
import { Button, Form, Input, NumberKeyboard, Picker, Popup, Selector, VirtualInput } from 'antd-mobile';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface PayStatementModalProps {
    open: boolean;
    onClose: () => void;
    wallet: WalletData | null;
    wallets: WalletData[];
    onSuccess?: () => void;
}

interface AmountInputProps {
    value?: string | number;
    onChange?: (val: string) => void;
    placeholder?: string;
}

const AmountInput = ({ value, onChange, placeholder }: AmountInputProps) => {
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
                onFocus={() => setVisible(true)}
                clearable
                onClear={() => onChange?.('')}
            />
            <NumberKeyboard
                visible={visible}
                onClose={() => setVisible(false)}
                onInput={(v) => onChange?.((value || '') + v)}
                onDelete={() => onChange?.((value || '').toString().slice(0, -1))}
            />
        </div>
    );
};

export const PayStatementModal = ({ open, onClose, wallet, wallets, onSuccess }: PayStatementModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const actionRaw = Form.useWatch('action', form);
    const action = Array.isArray(actionRaw) ? actionRaw[0] : actionRaw;
    const amount = Form.useWatch('amount', form);
    const refinanceFeeRate = Form.useWatch('refinanceFeeRate', form);

    const [sourcePickerVisible, setSourcePickerVisible] = useState(false);

    useEffect(() => {
        if (open && wallet) {
            const debt = (wallet.creditLimit || 0) - wallet.balance;

            form.setFieldsValue({
                action: ['PAY_FULL'],
                amount: debt > 0 ? debt : 0,
                sourceWalletId: [wallets.find(w => w._id !== wallet._id && (w.type === 'DEBIT_CARD' || w.type === 'BANK'))?._id]
            });
        }
    }, [open, wallet, wallets, form]);

    const mutation = useMutation({
        mutationFn: (payload: PayStatementPayload) => walletApi.payStatement(wallet!._id, payload),
        onSuccess: () => {
            toast.success('Thanh toán sao kê thành công');
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            onSuccess?.();
            onClose();
        },
        onError: () => {
            toast.error('Thanh toán thất bại');
        }
    });

    const onFinish = (values: Record<string, unknown>) => {
        if (!wallet) return;
        mutation.mutate({
            action: Array.isArray(values.action) ? values.action[0] : values.action as string,
            sourceWalletId: Array.isArray(values.sourceWalletId) ? values.sourceWalletId[0] : values.sourceWalletId as string,
            amount: values.amount as number,
            refinanceFeeRate: values.refinanceFeeRate as number | undefined
        });
    };

    const sourceWalletsParams = wallets.filter(w => w._id !== wallet?._id).map(w => ({
        label: `${w.name} (${formatCurrency(w.balance)})`,
        value: w._id
    }));

    return (
        <Popup
            visible={open}
            onMaskClick={onClose}
            bodyStyle={{ height: '75vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflowY: 'auto' }}
        >
            <div style={{ padding: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                    Thanh toán sao kê: {wallet?.name}
                </div>
                <Form 
                    form={form} 
                    layout="vertical" 
                    mode="card"
                    onFinish={onFinish}
                    footer={
                        <Button color="primary" type="submit" size="large" block loading={mutation.isPending} style={{ borderRadius: 8 }}>
                            Xác nhận thanh toán
                        </Button>
                    }
                >
                    <Form.Item name="action" label="Hình thức thanh toán" rules={[{ required: true }]}>
                        <Selector
                            columns={2}
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
                        trigger="onConfirm"
                        onClick={() => setSourcePickerVisible(true)}
                    >
                        <Picker
                            columns={[sourceWalletsParams]}
                            visible={sourcePickerVisible}
                            onClose={() => setSourcePickerVisible(false)}
                        >
                            {items => items.every(item => item === null) ? 'Chọn ví thanh toán' : items.map(item => item?.label).join('')}
                        </Picker>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Số tiền thanh toán (VND)"
                        rules={[{ required: true, message: 'Nhập số tiền' }]}
                    >
                        <AmountInput placeholder="0" />
                    </Form.Item>

                    {(action === 'REFINANCE' || action?.[0] === 'REFINANCE') && (
                        <>
                            <Form.Item
                                name="refinanceFeeRate"
                                label="Phí đáo hạn (%)"
                                rules={[{ required: true, message: 'Nhập % phí' }]}
                            >
                                <Input type="number" min={0} max={100} step={0.1} placeholder="Ví dụ: 1.8" clearable />
                            </Form.Item>

                            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 16, marginTop: 8, marginBottom: 16 }}>
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
                </Form>
            </div>
        </Popup>
    );
};
