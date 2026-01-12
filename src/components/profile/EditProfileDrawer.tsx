import { userApi } from '@/api/user.api';
import { Gender, UpdateProfileForm, UserData } from '@/types/user.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Drawer, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface EditProfileDrawerProps {
    open: boolean;
    onClose: () => void;
    user: UserData | null;
}

export const EditProfileDrawer = ({ open, onClose, user }: EditProfileDrawerProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (data: UpdateProfileForm) => userApi.updateProfile(data),
        onSuccess: () => {
            toast.success('Cập nhật thông tin thành công');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onClose();
        },
        onError: () => {
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        }
    });

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                fullName: user.fullName,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
            });
        }
    }, [open, user, form]);

    const handleFinish = (values: any) => {
        const payload: UpdateProfileForm = {
            fullName: values.fullName,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        };
        updateMutation.mutate(payload);
    };

    return (
        <Drawer
            title="Chỉnh Sửa Thông Tin Cá Nhân"
            open={open}
            onClose={onClose}
            placement="bottom"
            height="auto"
            className="profile-drawer" // Reuse existing drawer styles if compatible or define new ones
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                    <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"

                        placeholder="Chọn ngày sinh"
                    />
                </Form.Item>

                <Form.Item name="gender" label="Giới tính">
                    <Select placeholder="Chọn giới tính">
                        <Select.Option value={Gender.MALE}>Nam</Select.Option>
                        <Select.Option value={Gender.FEMALE}>Nữ</Select.Option>
                        <Select.Option value={Gender.OTHER}>Khác</Select.Option>
                    </Select>
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="middle"
                    loading={updateMutation.isPending}
                    style={{ marginTop: 16 }}
                >
                    Lưu thay đổi
                </Button>
            </Form>
        </Drawer>
    );
};
