import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi } from '@api/auth.api';
import { LoginForm, RegisterForm } from '@/types/auth.type';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setToken, setUser, logout: contextLogout } = useAuthContext();

    const login = async (data: LoginForm) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔐 Login attempt...');
            const response = await authApi.login(data);
            console.log('✅ Login API success:', {
                hasToken: !!response.access_token,
                hasUser: !!response.user,
                userEmail: response.user?.email
            });

            // Backend now returns both token AND user in one response
            setToken(response.access_token);
            setUser(response.user);

            console.log('✅ Login successful!');
            return true;
        } catch (err: any) {
            console.error('❌ Login error:', err);
            const errorMessage = err.message || 'Đăng nhập thất bại';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterForm) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.register(data);

            // Backend returns both token and user
            setToken(response.access_token);
            setUser(response.user);

            return true;
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        contextLogout();
    };

    return { login, register, logout, loading, error };
};
