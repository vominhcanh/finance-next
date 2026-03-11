import { GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button, Checkbox, Form, Input, Space } from 'antd-mobile';
import { toast } from 'sonner';
import { LoginForm as LoginFormType } from '../../types/auth.type';

export const LoginForm = () => {
    const [form] = Form.useForm();
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: LoginFormType) => {
        try {
            const success = await login(values);
            if (success) {
                toast.success('Đăng nhập thành công!');
                setTimeout(() => {
                    navigate({ to: '/' });
                }, 100);
            } else {
                toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra khi đăng nhập!');
        }
    };

    const handleGoogleSignIn = () => {
        toast.info('Chức năng đăng nhập Google đang được phát triển');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            padding: 24
        }}>
            <div style={{ width: '100%', maxWidth: 380 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(135deg, var(--adm-color-primary) 0%, #4A90E2 100%)',
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#ffffff'
                    }}>D</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2c33' }}>Chào mừng trở lại</h1>
                    <p style={{ fontSize: 13, color: '#5f6368', margin: 0 }}>Vui lòng nhập thông tin của bạn.</p>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    mode="card"
                    footer={
                        <Space direction="vertical" block style={{ '--gap': '24px' }}>
                            <Button
                                block
                                color="primary"
                                size="large"
                                type="submit"
                                loading={loading}
                                style={{ borderRadius: 30, fontSize: 16 }}
                            >
                                Đăng nhập
                            </Button>

                            <Button
                                block
                                size="large"
                                onClick={handleGoogleSignIn}
                                style={{ borderRadius: 30, fontSize: 16 }}
                            >
                                <Space align="center">
                                    <GoogleOutlined />
                                    <span>Đăng nhập với Google</span>
                                </Space>
                            </Button>

                            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#1f2c33' }}>
                                Chưa có tài khoản?{' '}
                                <a 
                                    onClick={() => navigate({ to: '/register' })}
                                    style={{ color: '#1f2c33', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
                                >
                                    Đăng ký
                                </a>
                            </div>
                        </Space>
                    }
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            placeholder="tim.jennings@example.com"
                            autoComplete="email"
                            clearable
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input
                            placeholder="••••••••"
                            autoComplete="current-password"
                            type="password"
                            clearable
                        />
                    </Form.Item>

                    <Form.Item name="remember">
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
