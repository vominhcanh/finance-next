import { useMedia } from '@/hooks/useMedia';
import { MobileOutlined } from '@ant-design/icons';
import { Result } from 'antd';

// Block if screen width is greater than 768px (Tablet/Desktop)
// Assuming the app is Mobile-only based on 'MobileLayout' usage.
export const DeviceRestriction = ({ children }: { children: React.ReactNode }) => {
    // Media query for Tablet and larger (min-width: 768px)
    const isUnsupported = useMedia('(min-width: 768px)');

    if (isUnsupported) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                padding: 20
            }}>
                <Result
                    icon={<MobileOutlined style={{ fontSize: 48, color: '#1890ff' }} />}
                    status="warning"
                    title="Giao diện không hỗ trợ trên thiết bị này"
                    subTitle="Vui lòng sử dụng trên thiết bị di động (điện thoại) để có trải nghiệm tốt nhất."
                />
            </div>
        );
    }

    return <>{children}</>;
};
