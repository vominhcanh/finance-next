import { userApi } from '@/api/user.api';
import { useAuthContext } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format.utils';
import {
    DollarOutlined,
    EditOutlined,
    LockOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, List, SpinLoading } from 'antd-mobile';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChangePasswordDrawer } from './ChangePasswordDrawer';
import { EditProfileDrawer } from './EditProfileDrawer';
import { SetLimitModal } from './SetLimitModal';

export const ProfilePage = () => {
    const { logout } = useAuthContext();
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [limitOpen, setLimitOpen] = useState(false);

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['profile'],
        queryFn: () => userApi.getProfile(),
        retry: 1
    });

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất thành công');
    };

    if (isLoading) {
        return (
            <div style={{ height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
                <SpinLoading color="primary" />
                <div style={{ color: 'var(--adm-color-primary)' }}>Đang tải thông tin...</div>
            </div>
        );
    }

    if (isError || !user) {
        return <div style={{ padding: 16, textAlign: 'center' }}>Không thể tải thông tin người dùng.</div>;
    }

    return (
        <div style={{ padding: 16, paddingBottom: 150, background: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, paddingBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', border: '1px solid #f0f0f0' }}>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <Button
                        size='small'
                        shape="rounded"
                        onClick={() => setEditOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '4px 12px', color: 'var(--adm-color-primary)', border: '1px solid var(--adm-color-primary)' }}
                    >
                        <EditOutlined /> Sửa
                    </Button>
                </div>

                <Avatar
                    src=""
                    style={{ '--size': '80px', '--border-radius': '50%', marginBottom: 16, background: '#f0f0f0', color: '#1f2c33', display: 'flex', alignItems: 'center', justifyContent: 'center' } as any}
                    fallback={<UserOutlined style={{ fontSize: 40 }} />}
                />

                <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2c33', marginBottom: 4 }}>{user.fullName || 'Người dùng mới'}</div>
                <div style={{ fontSize: 14, color: '#52c41a', background: '#f6ffed', padding: '4px 12px', borderRadius: 100, border: '1px solid #b7eb8f' }}>
                    Thành viên hợp lệ
                </div>
            </div>

            <List style={{ borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                <List.Item
                    prefix={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f4ff', color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><UserOutlined /></div>}
                    onClick={() => setEditOpen(true)}
                    style={{ padding: '8px 0' }}
                >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2c33' }}>Thông tin cá nhân</span>
                </List.Item>

                <List.Item
                    prefix={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#f6ffed', color: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><DollarOutlined /></div>}
                    onClick={() => setLimitOpen(true)}
                    extra={<span style={{ fontSize: 14, color: '#8c8c8c' }}>{user.monthlyLimit ? formatCurrency(user.monthlyLimit) : 'Chưa thiết lập'}</span>}
                    style={{ padding: '8px 0' }}
                >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2c33' }}>Hạn mức chi tiêu</span>
                </List.Item>

                <List.Item
                    prefix={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff1f0', color: '#ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><LockOutlined /></div>}
                    onClick={() => setPasswordOpen(true)}
                    style={{ padding: '8px 0' }}
                >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2c33' }}>Đổi mật khẩu</span>
                </List.Item>

                <List.Item
                    prefix={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f5f5', color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><LogoutOutlined /></div>}
                    onClick={handleLogout}
                    style={{ padding: '8px 0' }}
                >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#ff4d4f' }}>Đăng xuất</span>
                </List.Item>
            </List>

            <div style={{ textAlign: 'center', fontSize: 13, color: '#bfbfbf', marginTop: 16 }}>
                Phiên bản 1.0.0
            </div>

            <EditProfileDrawer
                open={editOpen}
                onClose={() => setEditOpen(false)}
                user={user}
            />

            <ChangePasswordDrawer
                open={passwordOpen}
                onClose={() => setPasswordOpen(false)}
            />

            <SetLimitModal
                open={limitOpen}
                onClose={() => setLimitOpen(false)}
                currentLimit={user.monthlyLimit}
            />
        </div>
    );
};
