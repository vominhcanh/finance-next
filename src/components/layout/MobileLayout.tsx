import { ReactNode } from 'react';
import { Layout } from 'antd';
import { BottomNavigation } from './BottomNavigation';
import './MobileLayout.scss';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

interface MobileLayoutProps {
    children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
    return (
        <Layout className="mobile-layout">
            <Header className="mobile-header">
                <div className="header-content">
                    <div className="search-bar-container">
                        <SearchOutlined className="search-icon" />
                        <input type="text" placeholder="Search anything..." className="search-input" />
                        <div className="search-actions">
                            <div className="separator"></div>
                            <FilterOutlined className="filter-icon" />
                        </div>
                    </div>
                </div>
            </Header>

            <Content className="mobile-content">
                {children}
            </Content>

            <BottomNavigation />
        </Layout>
    );
};
