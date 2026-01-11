import { useState } from 'react';
import { Button, Avatar, Spin, message } from 'antd';
import {
    UserOutlined,
    RightOutlined,
    EditOutlined,
    LockOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData, Gender } from '@/types/user.type';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { EditProfileDrawer } from './EditProfileDrawer';
import { ChangePasswordDrawer } from './ChangePasswordDrawer';
import './ProfilePage.scss';

// Icon helpers can be imported or used directly.
// Using basic Antd icons but wrapped in style to look like the reference.

export const ProfilePage = () => {
    const { logout } = useAuthContext();
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    // Fetch user profile
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['profile'],
        queryFn: () => userApi.getProfile(),
        retry: 1
    });

    const handleLogout = () => {
        logout();
        message.success('Đã đăng xuất thành công');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading-container">
                <Spin size="small" />
                <div className="loading-text">Đang tải thông tin...</div>
            </div>
        );
    }

    if (isError || !user) {
        return <div style={{ padding: 16, textAlign: 'center' }}>Không thể tải thông tin người dùng.</div>;
    }

    return (
        <div className="profile-page">
            {/* Profile Card */}
            <div className="user-info-card">
                <Button
                    className="edit-profile-btn"
                    size='small'
                    icon={<EditOutlined />}
                    onClick={() => setEditOpen(true)}
                >
                    Sửa
                </Button>

                <div className="avatar-section">
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                    />
                </div>

                <div className="user-name">{user.fullName || 'Người dùng mới'}</div>
                <div className="user-role">
                    Thành viên hợp lệ
                </div>
            </div>

            {/* Menu Section */}
            <div className="menu-section">
                {/* Personal Details */}
                <div className="menu-item" onClick={() => setEditOpen(true)}>
                    <div className="item-left">
                        <div className="icon-box">
                            <UserOutlined />
                        </div>
                        <span className="item-text">Thông tin cá nhân</span>
                    </div>
                    <div className="item-right">
                        <RightOutlined />
                    </div>
                </div>

                {/* Account Settings / Change Password */}
                <div className="menu-item" onClick={() => setPasswordOpen(true)}>
                    <div className="item-left">
                        <div className="icon-box">
                            <LockOutlined />
                        </div>
                        <span className="item-text">Đổi mật khẩu</span>
                    </div>
                    <div className="item-right">
                        <RightOutlined />
                    </div>
                </div>

                {/* Logout */}
                <div className="menu-item" onClick={handleLogout}>
                    <div className="item-left">
                        <div className="icon-box is-logout">
                            <LogoutOutlined />
                        </div>
                        <span className="item-text" style={{ color: '#ff4d4f' }}>Đăng xuất</span>
                    </div>
                    <div className="item-right">
                        <RightOutlined />
                    </div>
                </div>
            </div>

            <div className="version-text">
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
        </div>
    );
};
