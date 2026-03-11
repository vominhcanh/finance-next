import { useMutateDebt, useQueryDebt } from '@/queryHooks/debt';
import { useQueryWallets } from '@/queryHooks/wallet';
import { DebtType, InstallmentStatus } from '@/types/debt.type';
import { ArrowRightOutlined, CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { formatCurrency } from '@utils/format.utils';
import { Button, DatePicker, Form, Input, NumberKeyboard, Picker, Popup, ProgressBar, Space, SpinLoading, Tag, VirtualInput, Steps } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface DebtFormProps {
    id?: string;
    mode: 'create' | 'view';
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

export const DebtFormParam = ({ id }: DebtFormProps) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { create, update, payInstallment } = useMutateDebt();

    const isCreate = !id;
    const { data: debt, isLoading, refetch } = useQueryDebt(id || '', !isCreate);
    const { data: wallets } = useQueryWallets();

    const [activeTab, setActiveTab] = useState('1');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

    const [typePickerVisible, setTypePickerVisible] = useState(false);
    const [installmentPickerVisible, setInstallmentPickerVisible] = useState(false);
    const [startDateVisible, setStartDateVisible] = useState(false);
    const [walletPickerVisible, setWalletPickerVisible] = useState(false);

    const isInstallmentValue = Form.useWatch('isInstallment', form)?.[0] || Form.useWatch('isInstallment', form);
    const totalAmountValue = Form.useWatch('totalAmount', form);
    const totalMonthsValue = Form.useWatch('totalMonths', form);

    const isInstallment = isInstallmentValue === 1;

    useEffect(() => {
        if (isCreate && isInstallment && totalAmountValue && totalMonthsValue) {
            const monthly = Math.ceil(totalAmountValue / totalMonthsValue);
            form.setFieldValue('monthlyPayment', monthly);
        }
    }, [totalAmountValue, totalMonthsValue, isInstallment, isCreate, form]);

    useEffect(() => {
        if (debt && !isCreate) {
            form.setFieldsValue({
                ...debt,
                type: [debt.type],
                isInstallment: [debt.isInstallment ? 1 : 0],
                startDate: debt.startDate ? new Date(debt.startDate) : undefined,
            });
        } else {
            form.setFieldsValue({
                type: [DebtType.LOAN],
                isInstallment: [0],
                startDate: new Date(),
            });
        }
    }, [debt, form, isCreate]);

    const onFinish = (values: any) => {
        const payload = {
            ...values,
            type: values.type?.[0] || values.type,
            isInstallment: values.isInstallment?.[0] || values.isInstallment,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
        };

        if (isCreate) {
            create.mutate(payload, {
                onSuccess: () => navigate({ to: '/debts' }),
            });
        } else if (id) {
            update.mutate({ id, data: payload }, {
                onSuccess: () => toast.success('Cập nhật thành công'),
            });
        }
    };

    const handleOpenPaymentModal = (record: any) => {
        setSelectedInstallment(record);
        setSelectedWalletId(null);
        setPaymentModalOpen(true);
    };

    const handleConfirmPayment = () => {
        if (!selectedInstallment || !selectedWalletId) return;

        payInstallment.mutate(
            { installmentId: selectedInstallment._id, walletId: selectedWalletId },
            {
                onSuccess: () => {
                    toast.success('Thanh toán thành công');
                    setPaymentModalOpen(false);
                    refetch();
                },
            }
        );
    };

    const renderHeaderStats = () => {
        if (isCreate || !debt) return null;

        const paidMonths = debt.paidMonths || 0;
        const totalMonths = debt.totalMonths || 1;
        const percent = Math.round((paidMonths / totalMonths) * 100);

        return (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>Còn lại phải trả</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#ff4d4f', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                        {formatCurrency(debt.remainingAmount || 0)}
                    </div>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontWeight: 500, color: '#8c8c8c' }}>
                        <span style={{ fontWeight: 600, color: '#1f2c33' }}>Tiến độ trả nợ</span>
                        <span>{paidMonths} / {totalMonths} tháng</span>
                    </div>
                    <ProgressBar percent={percent} style={{ '--track-width': '10px', '--fill-color': '#1890ff', borderRadius: 100 }} />
                </div>
            </div>
        );
    };

    const renderFormContent = () => (
        <Form
            form={form}
            layout="vertical"
            mode="card"
            onFinish={onFinish}
            footer={
                <Button color="primary" type="submit" block size="large" style={{ borderRadius: 8 }}>
                    {isCreate ? 'Thêm Khoản Vay' : 'Cập Nhật'}
                </Button>
            }
        >
            <Form.Item name="partnerName" label="Tên đối tác" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Ngân hàng ABC..." clearable />
            </Form.Item>

            <Form.Item name="totalAmount" label="Tổng số tiền (VND)" rules={[{ required: true }]}>
                <AmountInput placeholder="0" />
            </Form.Item>

            <Form.Item
                name="type"
                label="Loại nợ"
                rules={[{ required: true }]}
                trigger="onConfirm"
                onClick={() => setTypePickerVisible(true)}
            >
                <Picker
                    columns={[[
                        { label: 'Đi vay', value: DebtType.LOAN },
                        { label: 'Cho vay', value: DebtType.LEND },
                    ]]}
                    visible={typePickerVisible}
                    onClose={() => setTypePickerVisible(false)}
                >
                    {items => items.every(item => item === null) ? 'Chọn loại nợ' : items.map(item => item?.label).join('')}
                </Picker>
            </Form.Item>

            <Form.Item
                name="isInstallment"
                label="Hình thức trả"
                trigger="onConfirm"
                onClick={() => { if (isCreate) setInstallmentPickerVisible(true); }}
            >
                <Picker
                    columns={[[
                        { label: 'Trả 1 lần', value: 0 },
                        { label: 'Trả góp', value: 1 }
                    ]]}
                    visible={installmentPickerVisible}
                    onClose={() => setInstallmentPickerVisible(false)}
                >
                    {items => items.every(item => item === null) ? 'Chọn hình thức trả' : items.map(item => item?.label).join('')}
                </Picker>
            </Form.Item>

            {isInstallment && (
                <Form.Item
                    name="startDate"
                    label="Ngày bắt đầu tính lãi/trả"
                    rules={[{ required: true }]}
                    trigger="onConfirm"
                    onClick={() => { if (isCreate) setStartDateVisible(true); }}
                >
                    <DatePicker visible={startDateVisible} onClose={() => setStartDateVisible(false)}>
                        {value => value ? dayjs(value).format('DD/MM/YYYY') : 'Chọn ngày'}
                    </DatePicker>
                </Form.Item>
            )}

            {isInstallment && (
                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginTop: 16, border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <ClockCircleOutlined /> Cấu hình trả góp
                    </div>
                    <Form.Item name="totalMonths" label="Tổng số tháng" rules={[{ required: true }]}>
                        <Input type="number" min={1} placeholder="Ví dụ: 12" disabled={!isCreate} clearable />
                    </Form.Item>
                    <Form.Item name="paymentDate" label="Ngày trả (1-31)" rules={[{ required: true }]}>
                        <Input type="number" min={1} max={31} placeholder="Ví dụ: 15" clearable />
                    </Form.Item>
                    <Form.Item name="monthlyPayment" label="Số tiền/tháng (VND)">
                        <AmountInput placeholder="Tự động tính nếu để trống" />
                    </Form.Item>
                </div>
            )}
        </Form>
    );

    const renderScheduleView = () => {
        if (!debt?.installments) return <div style={{ padding: 20, textAlign: 'center' }}>Chưa có dữ liệu lịch trả nợ</div>;

        const history = debt.installments.filter((i: any) => i.status === InstallmentStatus.PAID);
        const pending = debt.installments.find((i: any) => i.status !== InstallmentStatus.PAID);

        return (
            <div style={{ marginTop: 8 }}>
                {pending && (
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 12, marginBottom: 24, background: '#fff' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>Kỳ thanh toán tiếp theo (Kỳ {history.length + 1})</div>
                            <Tag color="danger">Cần thanh toán</Tag>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: '#8c8c8c', fontSize: 13 }}>Hạn trả:</span>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{dayjs(pending.dueDate).format('DD/MM/YYYY')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: '#8c8c8c', fontSize: 13 }}>Số tiền:</span>
                                <span style={{ fontSize: 18, fontWeight: 700, color: '#faad14' }}>{formatCurrency(pending.amount)}</span>
                            </div>
                            <Button color="primary" block style={{ marginTop: 16, borderRadius: 8 }} onClick={() => handleOpenPaymentModal(pending)}>
                                THANH TOÁN KỲ NÀY
                            </Button>
                        </div>
                    </div>
                )}

                {!pending && debt.remainingAmount === 0 && (
                    <div style={{ border: '1px solid #b7eb8f', borderRadius: 16, padding: 20, textAlign: 'center', background: '#f6ffed', marginBottom: 24 }}>
                        <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                        <div style={{ fontSize: 16, fontWeight: 600 }}>Khoản nợ đã hoàn tất!</div>
                    </div>
                )}

                <div style={{ padding: '0 10px', marginTop: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Lịch sử thanh toán</div>
                    <Steps direction="vertical">
                        {history.map((item: any, idx: number) => (
                            <Steps.Step
                                key={idx}
                                title={
                                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>Kỳ {idx + 1}</div> / 
                                        <Tag color="danger" style={{ marginLeft: 4 }}>{formatCurrency(item.amount)}</Tag>
                                    </div>
                                }
                                description={
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ fontSize: 13, color: '#8c8c8c' }}>{dayjs(item.paidAt || item.dueDate).format('DD/MM/YYYY')}</div>
                                        {(item.walletId || item.walletName) && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4, background: '#f5f5f5', color: '#6f6e6e', fontSize: 11, marginTop: 4 }}>
                                                <span>{item.walletId ? item.walletId.name : item.walletName}</span>
                                            </div>
                                        )}
                                    </div>
                                }
                                status="finish"
                            />
                        ))}
                    </Steps>
                    {history.length === 0 && <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>Chưa có lịch sử thanh toán</div>}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div style={{ height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
                <SpinLoading color="primary" />
                <div style={{ color: 'var(--adm-color-primary)' }}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <Space direction="vertical" block style={{ padding: 16, paddingBottom: 150, background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate({ to: '/debts' })}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2c33', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isCreate ? 'Thêm khoản nợ' : 'Chi tiết khoản nợ'}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', color: 'var(--adm-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => form.submit()}>
                    <CheckOutlined />
                </div>
            </div>

            {!isCreate && renderHeaderStats()}

            {isCreate ? renderFormContent() : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', background: '#e5e5e5', padding: 4, borderRadius: 8 }}>
                        <div
                            onClick={() => setActiveTab('1')}
                            style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 14, fontWeight: activeTab === '1' ? 600 : 500, color: activeTab === '1' ? '#1f2c33' : '#8c8c8c', background: activeTab === '1' ? '#fff' : 'transparent', borderRadius: 6, boxShadow: activeTab === '1' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        >Thông tin</div>
                        {isInstallment && (
                            <div
                                onClick={() => setActiveTab('2')}
                                style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 14, fontWeight: activeTab === '2' ? 600 : 500, color: activeTab === '2' ? '#1f2c33' : '#8c8c8c', background: activeTab === '2' ? '#fff' : 'transparent', borderRadius: 6, boxShadow: activeTab === '2' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                            >Lịch trả nợ</div>
                        )}
                    </div>
                    <div>
                        {activeTab === '1' && renderFormContent()}
                        {activeTab === '2' && renderScheduleView()}
                    </div>
                </div>
            )}

            <Popup
                visible={paymentModalOpen}
                onMaskClick={() => setPaymentModalOpen(false)}
                bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: '40vh' }}
            >
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Thanh toán kỳ trả góp</div>
                    {selectedInstallment && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f0f0f0', paddingBottom: 12, marginBottom: 12 }}>
                                <span style={{ color: '#8c8c8c' }}>Kỳ hạn:</span>
                                <span>{dayjs(selectedInstallment.dueDate).format('DD/MM/YYYY')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f0f0f0', paddingBottom: 12, marginBottom: 12 }}>
                                <span style={{ color: '#8c8c8c' }}>Số tiền:</span>
                                <span style={{ fontSize: 18, color: '#1890ff', fontWeight: 600 }}>{formatCurrency(selectedInstallment.amount)}</span>
                            </div>
                            <div style={{ marginTop: 24, padding: 10 }}>
                                <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>Nguồn tiền thanh toán</div>
                                <div onClick={() => setWalletPickerVisible(true)} style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: 8, fontSize: 16 }}>
                                    {selectedWalletId ? wallets?.find((w: any) => w._id === selectedWalletId)?.name : 'Chọn ví thanh toán'}
                                </div>
                                <Picker
                                    columns={[[...(wallets || []).map((w: any) => ({ label: `${w.name} (${formatCurrency(w.balance)})`, value: w._id }))]]}
                                    visible={walletPickerVisible}
                                    onClose={() => setWalletPickerVisible(false)}
                                    onConfirm={(val) => setSelectedWalletId(val[0]?.toString() || null)}
                                />
                            </div>
                            <Button color="primary" block style={{ marginTop: 24, borderRadius: 8 }} onClick={handleConfirmPayment}>
                                Xác nhận
                            </Button>
                        </div>
                    )}
                </div>
            </Popup>
        </Space>
    );
};
