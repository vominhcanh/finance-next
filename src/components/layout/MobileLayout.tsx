import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface MobileLayoutProps {
    children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, zIndex: 998,
                padding: '0 16px', display: 'flex', alignItems: 'center', background: '#fff',
                height: 70
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{
                        width: '100%', background: '#f1f1f1', borderRadius: 24, padding: '10px 20px',
                        display: 'flex', alignItems: 'center', gap: 12
                    }}>
                        <SearchOutlined style={{ fontSize: 20, color: '#9a9999' }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 16, color: '#262626' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 1, height: 24, backgroundColor: '#f0f0f0' }}></div>
                            <FilterOutlined style={{ fontSize: 20, color: '#262626', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: 70, minHeight: 'calc(100vh - 70px - 85px)',
                background: '#fff', paddingBottom: 85,
                maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto'
            }}>
                {children}
            </div>

            <BottomNavigation />
        </div>
    );
};
