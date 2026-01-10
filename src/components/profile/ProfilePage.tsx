import { Card, Typography, Button, Divider } from 'antd';
import { LogoutOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { MobileLayout } from '@components/layout/MobileLayout';
import { PrivateRoute } from '@components/layout/PrivateRoute';
import { useAuth } from '@hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';

const { Title, Text } = Typography;

export const ProfilePage = () => {
    const { user } = useAuthContext();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate({ to: '/login' });
    };

    return (
        <PrivateRoute>
            <MobileLayout>
                <div>
                    <Title level={3} style={{ marginBottom: '16px' }}>
                        Thông tin cá nhân
                    </Title>

                    <Card>
                        {user ? (
                            <>
                                <div style={{ marginBottom: '16px' }}>
                                    <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    <Text strong>Họ và tên:</Text>
                                    <br />
                                    <Text style={{ marginLeft: '24px' }}>{user.fullName}</Text>
                                </div>

                                <Divider />

                                <div style={{ marginBottom: '16px' }}>
                                    <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    <Text strong>Email:</Text>
                                    <br />
                                    <Text style={{ marginLeft: '24px' }}>{user.email}</Text>
                                </div>

                                <Divider />

                                <Button
                                    type="primary"
                                    danger
                                    icon={<LogoutOutlined />}
                                    onClick={handleLogout}
                                    block
                                    size="large"
                                    style={{ marginTop: '24px' }}
                                >
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <Text type="secondary">Đang tải thông tin...</Text>
                        )}
                    </Card>

                    <Card style={{ marginTop: '16px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Phiên bản: 1.0.0
                        </Text>
                    </Card>
                </div>
            </MobileLayout>
        </PrivateRoute>
    );
};
