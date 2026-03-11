import { GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button, Form, Input, Space } from 'antd-mobile';
import { toast } from 'sonner';
import { RegisterForm as RegisterFormType } from '../../types/auth.type';

export const RegisterForm = () => {
    const [form] = Form.useForm();
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: RegisterFormType & { confirmPassword: string }) => {
        const { email, password, fullName } = values;
        const success = await register({ email, password, fullName });
        if (success) {
            toast.success('Đăng ký thành công!');
            navigate({ to: '/' });
        } else {
            toast.error('Đăng ký thất bại. Vui lòng thử lại!');
        }
    };

    const handleGoogleSignIn = () => {
        toast.info('Chức năng đăng ký Google đang được phát triển');
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
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2c33' }}>Tạo tài khoản</h1>
                    <p style={{ fontSize: 13, color: '#5f6368', margin: 0 }}>Đăng ký ngay để bắt đầu sử dụng.</p>
                </div>

                <Form
                    form={form}
                    name="register"
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
                                Đăng ký
                            </Button>

                            <Button
                                block
                                size="large"
                                onClick={handleGoogleSignIn}
                                style={{ borderRadius: 30, fontSize: 16 }}
                            >
                                <Space align="center">
                                    <GoogleOutlined />
                                    <span>Đăng ký với Google</span>
                                </Space>
                            </Button>

                            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#1f2c33' }}>
                                Đã có tài khoản?{' '}
                                <a 
                                    onClick={() => navigate({ to: '/login' })}
                                    style={{ color: '#1f2c33', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
                                >
                                    Đăng nhập
                                </a>
                            </div>
                        </Space>
                    }
                >
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên!' },
                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
                        ]}
                    >
                        <Input
                            placeholder="Nguyễn Văn A"
                            autoComplete="name"
                            clearable
                        />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            placeholder="example@email.com"
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
                            autoComplete="new-password"
                            type="password"
                            clearable
                        />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input
                            placeholder="••••••••"
                            autoComplete="new-password"
                            type="password"
                            clearable
                        />
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
