import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button, Form, Input, Space } from 'antd';
import { toast } from 'sonner';
import { RegisterForm as RegisterFormType } from '../../types/auth.type';
import './AuthForm.scss';

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
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-logo">
                    <div className="logo-icon">D</div>
                </div>

                <div className="auth-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Đăng ký ngay để bắt đầu sử dụng.</p>
                </div>

                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
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
                            prefix={<UserOutlined />}
                            placeholder="Nguyễn Văn A"
                            autoComplete="name"
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
                            prefix={<MailOutlined />}
                            placeholder="example@email.com"
                            autoComplete="email"
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
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Đăng ký
                        </Button>

                        <Button
                            block
                            icon={<GoogleOutlined />}
                            onClick={handleGoogleSignIn}
                        >
                            Đăng ký với Google
                        </Button>
                    </Space>

                    <div className="auth-footer">
                        Đã có tài khoản?
                        <a onClick={() => navigate({ to: '/login' })}>Đăng nhập</a>
                    </div>
                </Form>
            </div>
        </div>
    );
};
