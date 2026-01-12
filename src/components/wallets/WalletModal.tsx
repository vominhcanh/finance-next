import { Drawer, Form, Input, Select, InputNumber, DatePicker, Row, Col, Button, ColorPicker, Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WalletData, WalletForm, WalletType, WalletStatus } from '@/types/wallet.type';
import { bankApi } from '@/api/bank.api';
import dayjs from 'dayjs';
import './WalletModal.scss';

interface WalletModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: WalletForm) => Promise<void>;
    initialValues?: WalletData | null;
    loading?: boolean;
}

const { Option } = Select;

export const WalletModal = ({ open, onCancel, onSubmit, initialValues, loading }: WalletModalProps) => {
    const [form] = Form.useForm();
    const walletType = Form.useWatch('type', form);

    const { data: banks } = useQuery({
        queryKey: ['banks'],
        queryFn: () => bankApi.getAll(),
        enabled: open,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
    console.log(banks);
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    issuanceDate: initialValues.issuanceDate ? dayjs(initialValues.issuanceDate) : undefined,
                    expirationDate: initialValues.expirationDate ? dayjs(initialValues.expirationDate) : undefined,
                    color: initialValues.color || '#1677ff', // Default color
                });
            } else {
                form.resetFields();
                form.setFieldValue('type', WalletType.CASH);
                form.setFieldValue('status', WalletStatus.ACTIVE);
                form.setFieldValue('color', '#1677ff');
            }
        }
    }, [open, initialValues, form]);

    const handleFinish = async (values: any) => {
        // Convert Color object to hex string if needed (Antd ColorPicker returns object)
        const colorHex = typeof values.color === 'string' ? values.color : values.color?.toHexString();
        await onSubmit({ ...values, color: colorHex });
        form.resetFields();
    };

    const isCard = [WalletType.BANK, WalletType.DEBIT_CARD, WalletType.CREDIT_CARD, WalletType.PREPAID_CARD].includes(walletType);
    const isCredit = walletType === WalletType.CREDIT_CARD;

    return (
        <Drawer
            title={initialValues ? 'Chỉnh Sửa Ví' : 'Thêm Ví Mới'}
            placement="bottom"
            onClose={onCancel}
            open={open}
            rootClassName="wallet-drawer"
            footer={null} // Custom footer via Form.Item
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false} // Cleaner look
            >
                <Row gutter={16} align="middle">
                    <Col span={20}>
                        <Form.Item
                            name="name"
                            label="Tên Ví"
                            rules={[{ required: true, message: 'Vui lòng nhập tên ví' }]}
                        >
                            <Input placeholder="Ví dụ: Tiền mặt, VCB Priority..." size="small" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="color" label="Màu">
                            <ColorPicker size="small" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Loại Ví"
                            rules={[{ required: true, message: 'Vui lòng chọn loại ví' }]}
                        >
                            <Select size="small">
                                <Option value={WalletType.CASH}>Tiền Mặt</Option>
                                <Option value={WalletType.BANK}>Ngân Hàng</Option>
                                <Option value={WalletType.DEBIT_CARD}>Thẻ Ghi Nợ</Option>
                                <Option value={WalletType.CREDIT_CARD}>Thẻ Tín Dụng</Option>
                                <Option value={WalletType.PREPAID_CARD}>Thẻ Trả Trước</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="status" label="Trạng Thái">
                            <Select size="small">
                                <Option value={WalletStatus.ACTIVE}>Hoạt Động</Option>
                                <Option value={WalletStatus.LOCKED}>Đã Khóa</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="balance"
                            label="Số Dư Hiện Tại"
                            rules={[{ required: true, message: 'Vui lòng nhập số dư' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                size="small"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                suffix="VND"
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {isCard && (
                    <>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item name="bankId" label="Ngân Hàng Liên Kết">
                                    <Select
                                        placeholder="Chọn ngân hàng"
                                        size="small"
                                        showSearch
                                        popupClassName="bank-select-dropdown"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        onChange={(value, option: any) => {
                                            const selectedBank = Array.isArray(banks) ? banks.find(b => b._id === value) : undefined;
                                            if (selectedBank && !form.getFieldValue('name')) {
                                                form.setFieldValue('name', selectedBank.shortName + ' Account');
                                            }
                                        }}
                                    >
                                        {(Array.isArray(banks) ? banks : []).map(bank => (
                                            <Option key={bank._id} value={bank._id} label={bank.shortName}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                                    <span style={{ fontWeight: 500 }}>{bank.name}</span>
                                                    <span style={{ color: '#000000', fontSize: 13 }}>({bank.code})</span>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="maskedNumber" label="Số Thẻ (4 số cuối)">
                                    <Input placeholder="**** 1234" maxLength={9} size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="cardType" label="Loại Thẻ">
                                    <Select allowClear size="small" placeholder="Chọn loại">
                                        <Option value="VISA">VISA</Option>
                                        <Option value="MASTER">MasterCard</Option>
                                        <Option value="JCB">JCB</Option>
                                        <Option value="NAPAS">Napas</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="issuanceDate" label="Ngày Phát Hành">
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="expirationDate" label="Ngày Hết Hạn">
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}

                {isCredit && (
                    <>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="creditLimit"
                                    label="Hạn Mức Tín Dụng"
                                    rules={[{ required: true, message: 'Vui lòng nhập hạn mức' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        size="large"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                        suffix="VND"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="statementDate"
                                    label="Ngày Sao Kê"
                                >
                                    <InputNumber min={1} max={31} style={{ width: '100%' }} size="large" placeholder="VD: 20" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="paymentDueDate"
                                    label="Ngày Hạn"
                                >
                                    <InputNumber min={1} max={31} style={{ width: '100%' }} size="large" placeholder="VD: 5" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="annualFee" label="Phí Thường Niên">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        size="large"
                                        formatter={(val) => val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                        parser={(val) => val?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                        placeholder="0"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}

                <Button type="primary" htmlType="submit" className="submit-btn" loading={loading} block size="large">
                    {initialValues ? 'Cập Nhật' : 'Thêm Ví Mới'}
                </Button>
            </Form>
        </Drawer>
    );
};
