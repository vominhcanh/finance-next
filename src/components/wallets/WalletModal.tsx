import { bankApi } from '@/api/bank.api';
import { WalletData, WalletForm, WalletStatus, WalletType } from '@/types/wallet.type';
import { useQuery } from '@tanstack/react-query';
import { Button, DatePicker, Form, Input, NumberKeyboard, Picker, Popup, VirtualInput } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from 'react';

interface WalletModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: WalletForm) => Promise<void>;
    initialValues?: WalletData | null;
    loading?: boolean;
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

export const WalletModal = ({ open, onCancel, onSubmit, initialValues, loading }: WalletModalProps) => {
    const [form] = Form.useForm();
    const walletTypeRaw = Form.useWatch('type', form);
    const walletType = Array.isArray(walletTypeRaw) ? walletTypeRaw[0] : walletTypeRaw;
    const creditLimit = Form.useWatch('creditLimit', form);
    const initialDebt = Form.useWatch('initialDebt', form);

    const isCredit = walletType === WalletType.CREDIT_CARD;

    const [typePickerVisible, setTypePickerVisible] = useState(false);
    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [bankPickerVisible, setBankPickerVisible] = useState(false);
    const [cardTypePickerVisible, setCardTypePickerVisible] = useState(false);
    const [issueDateVisible, setIssueDateVisible] = useState(false);
    const [expDateVisible, setExpDateVisible] = useState(false);

    const { data: banks } = useQuery({
        queryKey: ['banks'],
        queryFn: () => bankApi.getAll(),
        enabled: open,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    type: [initialValues.type],
                    status: [initialValues.status],
                    cardType: initialValues.cardType ? [initialValues.cardType] : undefined,
                    bankId: initialValues.bankId ? [initialValues.bankId] : undefined,
                    issuanceDate: initialValues.issuanceDate ? new Date(initialValues.issuanceDate) : undefined,
                    expirationDate: initialValues.expirationDate ? new Date(initialValues.expirationDate) : undefined,
                    color: initialValues.color || '#163f2a',
                    initialDebt: initialValues.type === WalletType.CREDIT_CARD
                        ? (initialValues.creditLimit || 0) - (initialValues.balance || 0)
                        : undefined,
                });
            } else {
                form.resetFields();
                form.setFieldValue('type', [WalletType.CASH]);
                form.setFieldValue('status', [WalletStatus.ACTIVE]);
                form.setFieldValue('color', '#163f2a');
            }
        }
    }, [open, initialValues, form]);

    const handleFinish = async (values: Record<string, unknown>) => {
        const submitValues = { 
            ...values,
            type: Array.isArray(values.type) ? values.type[0] : values.type,
            status: Array.isArray(values.status) ? values.status[0] : values.status,
            bankId: Array.isArray(values.bankId) ? values.bankId[0] : values.bankId,
            cardType: Array.isArray(values.cardType) ? values.cardType[0] : values.cardType,
            issuanceDate: values.issuanceDate ? (values.issuanceDate as Date).toISOString() : undefined,
            expirationDate: values.expirationDate ? (values.expirationDate as Date).toISOString() : undefined,
        } as WalletForm;

        if (walletType === WalletType.CREDIT_CARD) {
            submitValues.balance = (Number(values.creditLimit) || 0) - (Number(values.initialDebt) || 0);
        }

        await onSubmit(submitValues);
        form.resetFields();
    };

    const isCard = [WalletType.BANK, WalletType.DEBIT_CARD, WalletType.CREDIT_CARD, WalletType.PREPAID_CARD].includes(walletType);

    const typeColumns = [[
        { label: 'Tiền Mặt', value: WalletType.CASH },
        { label: 'Ngân Hàng', value: WalletType.BANK },
        { label: 'Thẻ Ghi Nợ', value: WalletType.DEBIT_CARD },
        { label: 'Thẻ Tín Dụng', value: WalletType.CREDIT_CARD },
        { label: 'Thẻ Trả Trước', value: WalletType.PREPAID_CARD },
    ]];

    const statusColumns = [[
        { label: 'Hoạt Động', value: WalletStatus.ACTIVE },
        { label: 'Đã Khóa', value: WalletStatus.LOCKED },
    ]];

    const bankColumns = [[
        ...(Array.isArray(banks) ? banks : []).map(b => ({ label: `${b.shortName} (${b.code})`, value: b._id }))
    ]];

    const cardTypeColumns = [[
        { label: 'VISA', value: 'VISA' },
        { label: 'MasterCard', value: 'MASTER' },
        { label: 'JCB', value: 'JCB' },
        { label: 'Napas', value: 'NAPAS' }
    ]];

    return (
        <Popup
            visible={open}
            onMaskClick={onCancel}
            bodyStyle={{ height: '85vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflowY: 'auto' }}
        >
            <div style={{ padding: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                    {initialValues ? 'Chỉnh Sửa Ví' : 'Thêm Ví Mới'}
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    mode="card"
                    onFinish={handleFinish}
                    footer={
                        <Button color="primary" type="submit" loading={loading} block size="large" style={{ borderRadius: 8 }}>
                            {initialValues ? 'Cập Nhật' : 'Thêm Ví Mới'}
                        </Button>
                    }
                >
                    <Form.Item name="name" label="Tên Ví" rules={[{ required: true, message: 'Vui lòng nhập tên ví' }]}>
                        <Input placeholder="Ví dụ: Tiền mặt, VCB Priority..." clearable />
                    </Form.Item>

                    <Form.Item name="color" label="Màu chủ đạo">
                        <Input type="color" style={{ height: 40, width: '100%', padding: 0, border: 'none' }} />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Loại Ví"
                        rules={[{ required: true, message: 'Vui lòng chọn loại ví' }]}
                        trigger="onConfirm"
                        onClick={() => setTypePickerVisible(true)}
                    >
                        <Picker
                            columns={typeColumns}
                            visible={typePickerVisible}
                            onClose={() => setTypePickerVisible(false)}
                        >
                            {items => items.every(item => item === null) ? 'Chọn loại ví' : items.map(item => item?.label).join('')}
                        </Picker>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng Thái"
                        trigger="onConfirm"
                        onClick={() => setStatusPickerVisible(true)}
                    >
                        <Picker
                            columns={statusColumns}
                            visible={statusPickerVisible}
                            onClose={() => setStatusPickerVisible(false)}
                        >
                            {items => items.every(item => item === null) ? 'Chọn trạng thái' : items.map(item => item?.label).join('')}
                        </Picker>
                    </Form.Item>

                    {(!isCredit) && (
                        <Form.Item
                            name="balance"
                            label="Số Dư Hiện Tại (VND)"
                            rules={[{ required: !isCredit, message: 'Vui lòng nhập số dư' }]}
                        >
                            <AmountInput placeholder="0" />
                        </Form.Item>
                    )}

                    {isCard && (
                        <>
                            <Form.Item 
                                name="bankId" 
                                label="Ngân Hàng Liên Kết"
                                trigger="onConfirm"
                                onClick={() => setBankPickerVisible(true)}
                            >
                                <Picker
                                    columns={bankColumns}
                                    visible={bankPickerVisible}
                                    onClose={() => setBankPickerVisible(false)}
                                    onConfirm={(val) => {
                                        const selectedBank = Array.isArray(banks) ? banks.find(b => b._id === val[0]) : undefined;
                                        if (selectedBank && !form.getFieldValue('name')) {
                                            form.setFieldValue('name', selectedBank.shortName + ' Account');
                                        }
                                    }}
                                >
                                    {items => items.every(item => item === null) ? 'Chọn ngân hàng' : items.map(item => item?.label).join('')}
                                </Picker>
                            </Form.Item>

                            <Form.Item name="maskedNumber" label="Số Thẻ (4 số cuối)">
                                <Input placeholder="**** 1234" maxLength={9} clearable />
                            </Form.Item>

                            <Form.Item 
                                name="cardType" 
                                label="Loại Thẻ"
                                trigger="onConfirm"
                                onClick={() => setCardTypePickerVisible(true)}
                            >
                                <Picker
                                    columns={cardTypeColumns}
                                    visible={cardTypePickerVisible}
                                    onClose={() => setCardTypePickerVisible(false)}
                                >
                                    {items => items.every(item => item === null) ? 'Chọn loại thẻ' : items.map(item => item?.label).join('')}
                                </Picker>
                            </Form.Item>

                            <Form.Item 
                                name="issuanceDate" 
                                label="Ngày Phát Hành"
                                trigger="onConfirm"
                                onClick={() => setIssueDateVisible(true)}
                            >
                                <DatePicker visible={issueDateVisible} onClose={() => setIssueDateVisible(false)}>
                                    {value => value ? dayjs(value).format('DD/MM/YYYY') : 'Chọn ngày'}
                                </DatePicker>
                            </Form.Item>

                            <Form.Item 
                                name="expirationDate" 
                                label="Ngày Hết Hạn"
                                trigger="onConfirm"
                                onClick={() => setExpDateVisible(true)}
                            >
                                <DatePicker visible={expDateVisible} onClose={() => setExpDateVisible(false)}>
                                    {value => value ? dayjs(value).format('DD/MM/YYYY') : 'Chọn ngày'}
                                </DatePicker>
                            </Form.Item>
                        </>
                    )}

                    {isCredit && (
                        <>
                            <Form.Item
                                name="creditLimit"
                                label="Hạn Mức Tín Dụng (VND)"
                                rules={[{ required: true, message: 'Vui lòng nhập hạn mức' }]}
                            >
                                <AmountInput placeholder="0" />
                            </Form.Item>

                            <Form.Item
                                name="initialDebt"
                                label="Dư nợ hiện tại (VND)"
                            >
                                <AmountInput placeholder="0" />
                            </Form.Item>

                            {(creditLimit || initialDebt) ? (
                                <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '8px 16px' }}>
                                    <span style={{ color: '#666', marginRight: 8 }}>Số dư khả dụng:</span>
                                    <span style={{ fontWeight: 700, color: 'var(--adm-color-primary)', fontSize: 15 }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((Number(creditLimit) || 0) - (Number(initialDebt) || 0))}
                                    </span>
                                </div>
                            ) : null}

                            <Form.Item name="statementDate" label="Ngày Sao Kê (1-31)">
                                <Input type="number" min={1} max={31} placeholder="VD: 20" clearable />
                            </Form.Item>

                            <Form.Item name="paymentDueDate" label="Ngày Hạn (1-31)">
                                <Input type="number" min={1} max={31} placeholder="VD: 5" clearable />
                            </Form.Item>

                            <Form.Item name="annualFee" label="Phí Thường Niên (VND)">
                                <AmountInput placeholder="0" />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </div>
        </Popup>
    );
};
