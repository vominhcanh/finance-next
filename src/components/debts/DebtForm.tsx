import { useMutateDebt, useQueryDebt } from '@/queryHooks/debt';
import { useQueryWallets } from '@/queryHooks/wallet';
import { DebtType, InstallmentStatus } from '@/types/debt.type';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { formatCurrency } from '@utils/format.utils';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Progress, Row, Select, Spin, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import './DebtForm.scss';

const { Title, Text } = Typography;
const { Option } = Select;

interface DebtFormProps {
    id?: string;
    mode: 'create' | 'view';
}

export const DebtFormParam = ({ id }: DebtFormProps) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { create, update, payInstallment } = useMutateDebt();

    // Query Data
    const isCreate = !id;
    const { data: debt, isLoading, refetch } = useQueryDebt(id || '', !isCreate);
    const { data: wallets } = useQueryWallets();

    // Local State
    const [activeTab, setActiveTab] = useState('1');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

    const isInstallmentValue = Form.useWatch('isInstallment', form);
    const totalAmountValue = Form.useWatch('totalAmount', form);
    const totalMonthsValue = Form.useWatch('totalMonths', form);

    const isInstallment = isInstallmentValue === 1;

    // Auto-calculate monthly payment
    useEffect(() => {
        if (isCreate && isInstallment && totalAmountValue && totalMonthsValue) {
            const monthly = Math.ceil(totalAmountValue / totalMonthsValue);
            form.setFieldValue('monthlyPayment', monthly);
        }
    }, [totalAmountValue, totalMonthsValue, isInstallment, isCreate, form]);

    // Initial Form Data
    useEffect(() => {
        if (debt && !isCreate) {
            form.setFieldsValue({
                ...debt,
                startDate: debt.startDate ? dayjs(debt.startDate) : undefined,
                // Ensure isInstallment comes as number from API, but just in case
                isInstallment: debt.isInstallment ? 1 : 0,
            });
        }
    }, [debt, form, isCreate]);

    // Handlers
    const onFinish = (values: any) => {
        const payload = {
            ...values,
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

    // --- RENDER SECTIONS ---

    // 1. Header Card (For Detail View)
    const renderHeaderStats = () => {
        if (isCreate || !debt) return null;

        const paidMonths = debt.paidMonths || 0;
        const totalMonths = debt.totalMonths || 1;
        const percent = Math.round((paidMonths / totalMonths) * 100);

        return (
            <Card className="debt-header-card" bordered={false}>
                <Row gutter={[24, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <div className="stat-item">
                            <Text type="secondary">Còn lại phải trả</Text>
                            <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                                {formatCurrency(debt.remainingAmount || 0)}
                            </Title>
                        </div>
                    </Col>
                    <Col xs={24} md={16}>
                        <div className="progress-section">
                            <div className="progress-info">
                                <Text strong>Tiến độ trả nợ</Text>
                                <Text>{paidMonths} / {totalMonths} tháng</Text>
                            </div>
                            <Progress percent={percent} strokeColor="#1890ff" trailColor="#f0f0f0" />
                        </div>
                    </Col>
                </Row>
            </Card>
        );
    };

    // 2. Form Content
    const renderFormContent = () => (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                type: DebtType.LOAN,
                isInstallment: 0,
                startDate: dayjs(),
            }}
            className="form-section API-form"
        >
            <Row gutter={[16, 0]}>
                <Col span={24}>
                    <Form.Item name="partnerName" label="Tên đối tác" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Ngân hàng ABC..." />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="totalAmount" label="Tổng số tiền" rules={[{ required: true }]}>
                        <InputNumber

                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            suffix="VND"
                            prefix={<DollarOutlined />}
                        />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="type" label="Loại nợ" rules={[{ required: true }]}>
                        <Select  >
                            <Option value={DebtType.LOAN}>Đi vay</Option>
                            <Option value={DebtType.LEND}>Cho vay</Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="isInstallment" label="Hình thức trả">
                        <Select

                            disabled={!isCreate} // Disable changing structure after creation
                            options={[
                                { label: 'Trả 1 lần', value: 0 },
                                { label: 'Trả góp', value: 1 }
                            ]}
                        />
                    </Form.Item>
                </Col>

                {/* Always show startDate if isInstallment=1, or optional/hidden logic? Requirement says Show if isInstallment=1 */}
                {isInstallment && (
                    <Col span={24}>
                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu tính lãi/trả"
                            rules={[{ required: true }]}
                            tooltip="Ngày bắt đầu trả nợ. Các kỳ trong quá khứ sẽ được đánh dấu là Đã Trả."
                        >
                            <DatePicker

                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                disabled={!isCreate} // Cannot change start date after creation
                            />
                        </Form.Item>
                    </Col>
                )}
            </Row>

            {isInstallment && (
                <div className="installment-config-box">
                    <Title level={5} className="box-title"><ClockCircleOutlined /> Cấu hình trả góp</Title>
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item name="totalMonths" label="Tổng số tháng" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1} disabled={!isCreate} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="paymentDate" label="Ngày trả (1-31)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1} max={31} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="monthlyPayment" label="Số tiền/tháng">
                                <InputNumber

                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                    placeholder="Tự động tính nếu để trống"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            )}


        </Form>
    );

    // 3. Schedule View (History + Pending)
    const renderScheduleView = () => {
        if (!debt?.installments) return <div style={{ padding: 20, textAlign: 'center' }}>Chưa có dữ liệu lịch trả nợ</div>;

        const history = debt.installments.filter((i: any) => i.status === InstallmentStatus.PAID);
        const pending = debt.installments.find((i: any) => i.status !== InstallmentStatus.PAID); // Get first pending/overdue

        return (
            <div className="schedule-view">
                {/* Pending Card - Priority */}
                {pending && (
                    <Card
                        className="pending-installment-card"
                        title={`Kỳ thanh toán tiếp theo (Kỳ ${history.length + 1})`}
                        extra={<Tag color="volcano">Cần thanh toán</Tag>}
                    >
                        <div className="pending-content">
                            <div className="row">
                                <Text type="secondary">Hạn trả:</Text>
                                <Text strong className="due-date">{dayjs(pending.dueDate).format('DD/MM/YYYY')}</Text>
                            </div>
                            <div className="row">
                                <Text type="secondary">Số tiền:</Text>
                                <Title level={4} style={{ margin: 0 }}>{formatCurrency(pending.amount)}</Title>
                            </div>
                            <Button
                                type='primary'
                                block
                                style={{ marginTop: 16 }}
                                onClick={() => handleOpenPaymentModal(pending)}
                            >
                                THANH TOÁN KỲ NÀY
                            </Button>
                        </div>
                    </Card>
                )}

                {!pending && debt.remainingAmount === 0 && (
                    <Card className="completed-card">
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                            <Title level={4}>Khoản nợ đã hoàn tất!</Title>
                        </div>
                    </Card>
                )}

                {/* History Timeline */}
                <div style={{ marginTop: 24, padding: '0 10px' }}>
                    <Title level={5} style={{ marginBottom: 20 }}>Lịch sử thanh toán</Title>
                    <Timeline
                        mode="left"
                        items={history.map((item: any, idx: number) => ({
                            color: '#52c41a', // Explicit green
                            label: <span style={{ fontSize: 13, color: '#8c8c8c' }}>{dayjs(item.paidAt || item.dueDate).format('DD/MM/YYYY')}</span>,
                            children: (
                                <div className="timeline-item-content">
                                    <div className="main-info">
                                        <div className="period-text">Kỳ {idx + 1}</div> /
                                        <Tag className="amount-text" color="red">
                                            {formatCurrency(item.amount)}
                                        </Tag>
                                    </div>
                                    {/* Wallet Info Supplement */}
                                    {(item.walletId || item.walletName) && (
                                        <div className="wallet-info">
                                            {item.walletId ? (
                                                <div className="wallet-chip">
                                                    <span>{item.walletId.name}</span>
                                                </div>
                                            ) : (
                                                <span className="wallet-text">{item.walletName}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        }))}
                    />
                    {history.length === 0 && <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>Chưa có lịch sử thanh toán</div>}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading-container">
                <Spin />
                <div className="loading-text">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="debt-form-container">
            <div className="custom-header">
                <div className="icon-btn back-btn" onClick={() => navigate({ to: '/debts' })}>
                    <ArrowLeftOutlined />
                </div>
                <div className="page-title">
                    {isCreate ? 'Thêm khoản nợ' : 'Chi tiết khoản nợ'}
                </div>
                <div className="icon-btn action-btn" onClick={() => form.submit()}>
                    {(isCreate || activeTab === '1') && (
                        isCreate ? <PlusOutlined /> : <SaveOutlined />
                    )}
                </div>
            </div>

            {/* Render Header Stats if viewing detail */}
            {!isCreate && renderHeaderStats()}

            {/* Logic to switch between Form and Schedule in View Mode */}
            {isCreate ? renderFormContent() : (
                <div className="detail-tabs-container">
                    <div className="tab-switcher">
                        <div className={`tab-item ${activeTab === '1' ? 'active' : ''}`} onClick={() => setActiveTab('1')}>Thông tin</div>
                        {isInstallment && (
                            <div className={`tab-item ${activeTab === '2' ? 'active' : ''}`} onClick={() => setActiveTab('2')}>Lịch trả nợ</div>
                        )}
                    </div>

                    <div className="tab-content">
                        {activeTab === '1' && renderFormContent()}
                        {activeTab === '2' && renderScheduleView()}
                    </div>
                </div>
            )}

            <Modal
                title="Thanh toán kỳ trả góp"
                open={paymentModalOpen}
                centered
                onCancel={() => setPaymentModalOpen(false)}
                onOk={handleConfirmPayment}
                okText="Xác nhận"
                cancelText="Đóng"
                confirmLoading={payInstallment.isPending}
                className="payment-modal"
                width={400}
            >
                {selectedInstallment && (
                    <div className="payment-modal-content">
                        <div className="info-box">
                            <Text type="secondary">Kỳ hạn:</Text>
                            <Text strong>{dayjs(selectedInstallment.dueDate).format('DD/MM/YYYY')}</Text>
                        </div>
                        <div className="info-box">
                            <Text type="secondary">Số tiền:</Text>
                            <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{formatCurrency(selectedInstallment.amount)}</Text>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <Select
                                className="wallet-select"
                                placeholder="Chọn ví thanh toán"
                                style={{ width: '100%' }}
                                value={selectedWalletId}
                                onChange={setSelectedWalletId}
                                optionLabelProp="label"
                                size='middle'
                            >
                                {wallets?.map((w: any) => (
                                    <Option key={w._id} value={w._id} label={w.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{w.name}</span>
                                            <span style={{ color: '#52c41a' }}>{formatCurrency(w.balance)}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
