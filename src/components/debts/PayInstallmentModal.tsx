
import { useMutateDebt } from '@/queryHooks/debt';
import { useQueryWallets } from '@/queryHooks/wallet';
import { formatCurrency } from '@utils/format.utils';
import { Form, Modal, Select, Typography } from 'antd';
import { useEffect } from 'react';
import { toast } from 'sonner';

const { Text } = Typography;
const { Option } = Select;

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

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            if (!data) return;

            payInstallment.mutate(
                {
                    installmentId: data.installmentId,
                    walletId: values.walletId
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
        });
    };

    return (
        <Modal
            title="Thanh toán kỳ trả góp"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Xác nhận"
            cancelText="Đóng"
            confirmLoading={payInstallment.isPending}
            centered
        >
            {data && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text type="secondary">Khoản vay:</Text>
                            <Text strong>{data.name}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text type="secondary">Kỳ hạn:</Text>
                            <Text>{data.installmentDisplay}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Số tiền:</Text>
                            <Text strong style={{ color: '#faad14', fontSize: 16 }}>
                                {formatCurrency(data.amount)}
                            </Text>
                        </div>
                    </div>

                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="walletId"
                            label="Nguồn tiền thanh toán"
                            rules={[{ required: true, message: 'Vui lòng chọn ví' }]}
                        >
                            <Select placeholder="Chọn ví">
                                {wallets?.map((w: any) => (
                                    <Option key={w._id} value={w._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{w.name}</span>
                                            <span style={{ color: '#52c41a' }}>{formatCurrency(w.balance)}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Modal>
    );
};
