import { userApi } from '@/api/user.api';
import { ChangePasswordForm } from '@/types/user.type';
import { useMutation } from '@tanstack/react-query';
import { Button, Drawer, Form, Input } from 'antd';
import { toast } from 'sonner';

interface ChangePasswordDrawerProps {
    open: boolean;
    onClose: () => void;
}

export const ChangePasswordDrawer = ({ open, onClose }: ChangePasswordDrawerProps) => {
    const [form] = Form.useForm();

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordForm) => userApi.changePassword(data),
        onSuccess: () => {
            toast.success('Đổi mật khẩu thành công');
            form.resetFields();
            onClose();
        },
        onError: () => {
            toast.error('Đổi mật khẩu thất bại. Mật khẩu cũ không đúng?');
        }
    });

    const handleFinish = (values: any) => {
        const payload: ChangePasswordForm = {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
        };
        changePasswordMutation.mutate(payload);
    };

    return (
        <Drawer
            title="Đổi Mật Khẩu"
            open={open}
            onClose={onClose}
            placement="bottom"
            height="auto"
            className="profile-drawer"
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Nhập lại mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu nhập lại không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="middle"
                    loading={changePasswordMutation.isPending}
                    style={{ marginTop: 16 }}
                >
                    Đổi mật khẩu
                </Button>
            </Form>
        </Drawer>
    );
};
