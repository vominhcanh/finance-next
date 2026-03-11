import { userApi } from '@/api/user.api';
import { Gender, UpdateProfileForm, UserData } from '@/types/user.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Form, Input, Picker, Popup } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditProfileDrawerProps {
    open: boolean;
    onClose: () => void;
    user: UserData | null;
}

export const EditProfileDrawer = ({ open, onClose, user }: EditProfileDrawerProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [dateVisible, setDateVisible] = useState(false);
    const [genderVisible, setGenderVisible] = useState(false);

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
                gender: [user.gender],
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
            });
        }
    }, [open, user, form]);

    const handleFinish = (values: any) => {
        const payload: UpdateProfileForm = {
            fullName: values.fullName,
            gender: values.gender?.[0] || values.gender,
            dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : undefined,
        };
        updateMutation.mutate(payload);
    };

    return (
        <Popup
            visible={open}
            onMaskClick={onClose}
            bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: '40vh' }}
        >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                Chỉnh Sửa Thông Tin Cá Nhân
            </div>
            
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                footer={
                    <Button color="primary" type="submit" block size="large" loading={updateMutation.isPending} style={{ borderRadius: 8 }}>
                        Lưu thay đổi
                    </Button>
                }
            >
                <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                    <Input placeholder="Nhập họ và tên" clearable />
                </Form.Item>

                <Form.Item name="dateOfBirth" label="Ngày sinh" trigger="onConfirm" onClick={() => setDateVisible(true)}>
                    <DatePicker visible={dateVisible} onClose={() => setDateVisible(false)}>
                        {value => value ? dayjs(value).format('DD/MM/YYYY') : 'Chọn ngày sinh'}
                    </DatePicker>
                </Form.Item>

                <Form.Item name="gender" label="Giới tính" trigger="onConfirm" onClick={() => setGenderVisible(true)}>
                    <Picker
                        columns={[[
                            { label: 'Nam', value: Gender.MALE },
                            { label: 'Nữ', value: Gender.FEMALE },
                            { label: 'Khác', value: Gender.OTHER },
                        ]]}
                        visible={genderVisible}
                        onClose={() => setGenderVisible(false)}
                    >
                        {items => items.every(item => item === null) ? 'Chọn giới tính' : items.map(item => item?.label).join('')}
                    </Picker>
                </Form.Item>
            </Form>
        </Popup>
    );
};
