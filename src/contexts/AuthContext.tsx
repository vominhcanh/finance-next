import { User } from '@/types/auth.type';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(
        () => localStorage.getItem('access_token')
    );
    const [user, setUser] = useState<User | null>(null);

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('access_token', newToken);
        } else {
            localStorage.removeItem('access_token');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const isAuthenticated = !!token;

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'access_token') {
                window.location.reload();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, setToken, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};
