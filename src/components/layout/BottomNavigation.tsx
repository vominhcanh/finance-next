import { Link, useLocation } from '@tanstack/react-router';
import {
    HomeOutlined,
    FileTextOutlined,
    WalletOutlined,
    UserOutlined,
} from '@ant-design/icons';
import './BottomNavigation.scss';

export const BottomNavigation = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="bottom-navigation">
            <Link to="/transactions" className={`nav-item ${isActive('/transactions') ? 'active' : ''}`}>
                <div className="nav-icon"><FileTextOutlined /></div>
            </Link>
            <Link to="/wallets" className={`nav-item ${isActive('/wallets') ? 'active' : ''}`}>
                <div className="nav-icon"><WalletOutlined /></div>
            </Link>
            <Link to="/" className="nav-fab">
                <div className="fab-circle">
                    <HomeOutlined />
                </div>
            </Link>
            <Link to="/debts" className={`nav-item ${isActive('/debts') ? 'active' : ''}`}>
                <div className="nav-icon"><FileTextOutlined /></div>
            </Link>
            <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
                <div className="nav-icon"><UserOutlined /></div>
            </Link>
        </div>
    );
};
