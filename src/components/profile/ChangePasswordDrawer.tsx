import { userApi } from '@/api/user.api';
import { ChangePasswordForm } from '@/types/user.type';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Popup } from 'antd-mobile';
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
        if (values.newPassword !== values.confirmPassword) {
            toast.error('Mật khẩu nhập lại không khớp');
            return;
        }

        const payload: ChangePasswordForm = {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
        };
        changePasswordMutation.mutate(payload);
    };

    return (
        <Popup
            visible={open}
            onMaskClick={onClose}
            bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: '40vh' }}
        >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                Đổi Mật Khẩu
            </div>

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                footer={
                    <Button color="primary" type="submit" block size="large" loading={changePasswordMutation.isPending} style={{ borderRadius: 8 }}>
                        Đổi mật khẩu
                    </Button>
                }
            >
                <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                >
                    <Input type="password" placeholder="Nhập mật khẩu hiện tại" clearable />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input type="password" placeholder="Nhập mật khẩu mới" clearable />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Nhập lại mật khẩu mới"
                    rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu mới' }]}
                >
                    <Input type="password" placeholder="Nhập lại mật khẩu mới" clearable />
                </Form.Item>
            </Form>
        </Popup>
    );
};
