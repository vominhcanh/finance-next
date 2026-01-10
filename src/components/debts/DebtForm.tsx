import { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, InputNumber, Row, Col, Typography, Table, Tag, Tabs, Modal, message, Spin } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useMutateDebt, useQueryDebt } from '@/queryHooks/debt';
import { useQueryWallets } from '@/queryHooks/wallet';
import { DebtType, InstallmentStatus } from '@/types/debt.type';
import { formatCurrency } from '@utils/format.utils';
import { SaveOutlined, LeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './DebtForm.scss';

const { Title, Text } = Typography;
const { Option } = Select;

interface DebtFormProps {
    id?: string;
    mode: 'create' | 'view'; // Keeping prop for compatibility but treating 'view' as 'edit' internally
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

    const isInstallment = Form.useWatch('isInstallment', form);

    // Initial Form Data
    useEffect(() => {
        if (debt && !isCreate) {
            form.setFieldsValue({
                ...debt,
                startDate: debt.startDate ? dayjs(debt.startDate) : undefined,
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
                onSuccess: () => message.success('Cập nhật thành công'),
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
                    message.success('Thanh toán thành công');
                    setPaymentModalOpen(false);
                    refetch(); // Reload data
                    setActiveTab('2'); // Ensure we stay on Installment tab or switch to it? User said "reload detail and go to tab installment"
                    // If we are paying, we are likely already on tab 2.
                },
            }
        );
    };

    const installmentColumns = [
        {
            title: 'Hạn trả',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (text: string) => <Text>{dayjs(text).format('DD/MM/YYYY')}</Text>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_: any, record: any) => (
                record.status !== InstallmentStatus.PAID ? (
                    <Tag
                        color="red"
                        variant='solid'
                        onClick={() => handleOpenPaymentModal(record)}
                    >
                        Thanh toán
                    </Tag>
                ) : <Tag color="green" variant='solid'>Đã thanh toán</Tag>
            ),
        }
    ];

    // Main Render Content
    const renderFormContent = () => (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                type: DebtType.LOAN,
                isInstallment: false,
                startDate: dayjs(),
            }}
            className="form-section API-form"
        >
            <Row gutter={[16, 0]}>
                <Col span={24}>
                    <Form.Item name="partnerName" label="Tên đối tác (Người vay/Cho vay)" rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}>
                        <Input placeholder="Ví dụ: Ngân hàng ABC, Anh Nam..." />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="totalAmount" label="Tổng số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            suffix="VND"
                        />
                    </Form.Item>
                </Col>

                <Col span={12} md={8}>
                    <Form.Item name="type" label="Loại nợ" rules={[{ required: true }]}>
                        <Select>
                            <Option value={DebtType.LOAN}> Vay</Option>
                            <Option value={DebtType.LEND}> Cho vay</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12} md={8}>
                    <Form.Item name="isInstallment" label="Hình thức trả" valuePropName="checked">
                        <Select
                            options={[
                                { label: 'Trả 1 lần', value: false },
                                { label: 'Trả góp (Nhiều kỳ)', value: true }
                            ]}
                        />
                    </Form.Item>
                </Col>
                <Col span={24} md={8}>
                    <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder='Chọn ngày' />
                    </Form.Item>
                </Col>
            </Row>

            {isInstallment && (
                <div className="installment-config-box">
                    <Title level={5}>Cấu hình trả góp</Title>
                    <Row gutter={[16, 0]}>
                        <Col span={12} md={8}>
                            <Form.Item name="totalMonths" label="Tổng số tháng" rules={[{ required: isInstallment, message: 'Nhập số tháng' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 12" />
                            </Form.Item>
                        </Col>
                        <Col span={12} md={8}>
                            <Form.Item name="paymentDate" label="Ngày trả hàng tháng" rules={[{ required: isInstallment, message: 'Nhập ngày (1-31)' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} max={31} placeholder="VD: 10" />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={8}>
                            <Form.Item name="monthlyPayment" label="Số tiền hàng tháng">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                    placeholder="Tự động chia đều"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            )}
        </Form>
    );

    const renderInstallmentTab = () => (
        <div >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>Lịch sử trả góp</Title>
                <Tag color="blue" >
                    {debt?.installments?.filter((i: any) => i.status === InstallmentStatus.PAID).length}/{debt?.totalMonths} kỳ đã trả
                </Tag>
            </div>
            <Table
                dataSource={debt?.installments || []}
                columns={installmentColumns as any}
                rowKey="_id"
                pagination={false}
                scroll={{ x: true, y: 500 }}
                bordered
            />
        </div>
    );

    const tabsItems = [
        {
            key: '1',
            label: 'Thông tin chung',
            children: renderFormContent(),
        },
        ...(isInstallment && !isCreate ? [{
            key: '2',
            label: 'Danh sách kỳ trả góp',
            children: renderInstallmentTab(),
        }] : []),
    ];

    if (isLoading) {
        return (
            <div className="debt-form-container" >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="debt-form-container">
            <div className="form-header">
                <h2 className="page-title">
                    <Button
                        type="text"
                        size="small"
                        icon={<LeftOutlined />}
                        className="back-btn"
                        onClick={() => navigate({ to: '/debts' })}
                    />
                    {isCreate ? 'Thêm mới khoản vay' : 'Chi tiết khoản vay'}
                </h2>
                <div className="header-actions">
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={create.isPending || update.isPending}
                        onClick={form.submit}
                    >
                        {isCreate ? 'Lưu mới' : 'Cập nhật'}
                    </Button>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabsItems}
                className="custom-tabs"
                type='card'
            />

            <Modal
                title="Thanh toán kỳ trả góp"
                open={paymentModalOpen}
                centered
                onCancel={() => setPaymentModalOpen(false)}
                onOk={handleConfirmPayment}
                okText="Xác nhận thanh toán"
                cancelText="Đóng"
                confirmLoading={payInstallment.isPending}
                className="payment-modal"
                width={400}
            >
                {selectedInstallment && (
                    <div className="payment-modal-content">
                        <div className="payment-info-row">
                            <div className="payment-info-group">
                                <Text className="label">Kỳ thanh toán:</Text>
                                <div className="value date-value">
                                    {dayjs(selectedInstallment.dueDate).format('DD/MM/YYYY')}
                                </div>
                            </div>

                            <div className="payment-info-group">
                                <Text className="label">Số tiền cần trả:</Text>
                                <div className="value amount-value">
                                    {formatCurrency(selectedInstallment.amount)}
                                </div>
                            </div>
                        </div>

                        <div className="payment-info-group full-width">
                            <Text className="label">Chọn ví thanh toán:</Text>
                            <Select
                                className="wallet-select"
                                placeholder="Chọn ví thanh toán"
                                size="small"
                                value={selectedWalletId}
                                onChange={setSelectedWalletId}
                                optionLabelProp="label"
                                popupClassName="wallet-select-dropdown"
                            >
                                {wallets?.map((w: any) => (
                                    <Option key={w._id} value={w._id} label={w.name}>
                                        <div className="wallet-option-item">
                                            <span className="wallet-name">{w.name}</span>
                                            <span className="wallet-balance">{formatCurrency(w.balance)}</span>
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
