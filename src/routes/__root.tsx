import { DeviceRestriction } from '@/components/common/DeviceRestriction';
import { AuthProvider } from '@/contexts/AuthContext';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

const RootComponent = () => {
    return (
        <DeviceRestriction>
            <AuthProvider>
                <ConfigProvider
                    locale={viVN}
                    theme={{
                        token: {
                            colorPrimary: '#1890ff',
                            colorLink: '#1890ff',
                            fontSize: 14,
                            fontFamily: `'SVN-Gilroy', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
                            borderRadius: 6,
                            controlHeight: 38,
                        },
                    }}
                    form={{
                        requiredMark(labelNode, info) {
                            return (
                                <span>
                                    {labelNode} {info.required && <span style={{ color: 'red' }}>(*)</span>}
                                </span>
                            );
                        },
                    }}
                >
                    <Outlet />
                </ConfigProvider>
            </AuthProvider>
        </DeviceRestriction>
    );
};

export const Route = createRootRoute({
    component: RootComponent,
});
