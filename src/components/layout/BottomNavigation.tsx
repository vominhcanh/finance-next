import { Link, useLocation } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
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
                <div className="nav-icon">
                    <Icon icon="icon-park-outline:transaction" width="32" height="32" />
                </div>
            </Link>
            <Link to="/wallets" className={`nav-item ${isActive('/wallets') ? 'active' : ''}`}>
                <div className="nav-icon">
                    <Icon icon="fluent:wallet-credit-card-32-regular" width="32" height="32" />
                </div>
            </Link>
            <Link to="/" className="nav-fab">
                <div className="fab-circle">
                    <Icon icon="solar:home-broken" width="24" height="24" />
                </div>
            </Link>
            <Link to="/debts" className={`nav-item ${isActive('/debts') ? 'active' : ''}`}>
                <div className="nav-icon">
                    <Icon icon="solar:hand-money-linear" width="32" height="32" />
                </div>
            </Link>
            <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
                <div className="nav-icon">
                    <Icon icon="uil:setting" width="32" height="32" />
                </div>
            </Link>
        </div>
    );
};
