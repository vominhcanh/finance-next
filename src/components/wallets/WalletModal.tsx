import { Drawer, Form, Input, Select, InputNumber, DatePicker, Row, Col, Button } from 'antd';
import { useEffect } from 'react';
import { WalletData, WalletForm, WalletType, WalletStatus } from '@/types/wallet.type';
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

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    issuanceDate: initialValues.issuanceDate ? dayjs(initialValues.issuanceDate) : undefined,
                    expirationDate: initialValues.expirationDate ? dayjs(initialValues.expirationDate) : undefined,
                });
            } else {
                form.resetFields();
                form.setFieldValue('type', WalletType.CASH);
                form.setFieldValue('status', WalletStatus.ACTIVE);
            }
        }
    }, [open, initialValues, form]);

    const handleFinish = async (values: any) => {
        await onSubmit(values);
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
            className="wallet-drawer"
            footer={null} // Custom footer via Form.Item
            height="auto"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false} // Cleaner look
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên Ví"
                            rules={[{ required: true, message: 'Vui lòng nhập tên ví' }]}
                        >
                            <Input placeholder="Ví dụ: Tiền mặt, VCB Priority..." size="large" />
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
                                <Form.Item name="bankName" label="Tên Ngân Hàng">
                                    <Input placeholder="Ví dụ: TPBank, Vietcombank..." size="large" />
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
