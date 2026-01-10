import { Form, Input, Button, Checkbox, Space, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { LoginForm as LoginFormType } from '../../types/auth.type';
import { useNavigate } from '@tanstack/react-router';
import './AuthForm.scss';

export const LoginForm = () => {
    const [form] = Form.useForm();
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: LoginFormType) => {
        try {
            const success = await login(values);
            if (success) {
                message.success('Đăng nhập thành công!');
                setTimeout(() => {
                    navigate({ to: '/' });
                }, 100);
            } else {
                message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            }
        } catch (err: any) {
            message.error(err.message || 'Có lỗi xảy ra khi đăng nhập!');
        }
    };

    const handleGoogleSignIn = () => {
        message.info('Chức năng đăng nhập Google đang được phát triển');
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-logo">
                    <div className="logo-icon">D</div>
                </div>
                <div className="auth-header">
                    <h1>Chào mừng trở lại</h1>
                    <p>Vui lòng nhập thông tin của bạn.</p>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
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
                            prefix={<MailOutlined />}
                            placeholder="tim.jennings@example.com"
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
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>

                    <Space direction="vertical" size="middle" className='action-btns'>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Đăng nhập
                        </Button>

                        <Button
                            block
                            icon={<GoogleOutlined />}
                            onClick={handleGoogleSignIn}
                        >
                            Đăng nhập với Google
                        </Button>
                    </Space>

                    <div className="auth-footer">
                        Chưa có tài khoản?
                        <a onClick={() => navigate({ to: '/register' })}>Đăng ký</a>
                    </div>
                </Form>
            </div>
        </div>
    );
};
