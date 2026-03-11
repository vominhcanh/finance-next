import { Icon } from '@iconify/react';
import { Link, useLocation } from '@tanstack/react-router';

export const BottomNavigation = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: 85,
            background: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '0 16px 10px 16px', zIndex: 999,
            boxShadow: '0 -5px 30px rgba(0, 0, 0, 0.08)'
        }}>
            <Link to="/transactions" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', color: isActive('/transactions') ? 'var(--adm-color-primary)' : '#a0a0a0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: '100%', position: 'relative'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isActive('/transactions') ? 'translateY(-2px)' : 'none',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))'
                }}>
                    <Icon icon="icon-park-outline:transaction" width="32" height="32" />
                </div>
                {isActive('/transactions') && <div style={{ position: 'absolute', bottom: 15, width: 4, height: 4, background: 'var(--adm-color-primary)', borderRadius: '50%' }} />}
            </Link>

            <Link to="/wallets" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', color: isActive('/wallets') ? 'var(--adm-color-primary)' : '#a0a0a0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: '100%', position: 'relative'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isActive('/wallets') ? 'translateY(-2px)' : 'none',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))'
                }}>
                    <Icon icon="fluent:wallet-credit-card-32-regular" width="32" height="32" />
                </div>
                {isActive('/wallets') && <div style={{ position: 'absolute', bottom: 15, width: 4, height: 4, background: 'var(--adm-color-primary)', borderRadius: '50%' }} />}
            </Link>

            <Link to="/" style={{
                position: 'relative', top: -25, width: 64, height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
            }}>
                <div style={{
                    width: 58, height: 58, background: 'var(--adm-color-primary)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(22, 63, 42, 0.4)', border: '4px solid #ffffff',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    <Icon icon="solar:home-broken" width="24" height="24" color="white" />
                </div>
            </Link>

            <Link to="/debts" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', color: isActive('/debts') ? 'var(--adm-color-primary)' : '#a0a0a0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: '100%', position: 'relative'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isActive('/debts') ? 'translateY(-2px)' : 'none',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))'
                }}>
                    <Icon icon="solar:hand-money-linear" width="32" height="32" />
                </div>
                {isActive('/debts') && <div style={{ position: 'absolute', bottom: 15, width: 4, height: 4, background: 'var(--adm-color-primary)', borderRadius: '50%' }} />}
            </Link>

            <Link to="/profile" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', color: isActive('/profile') ? 'var(--adm-color-primary)' : '#a0a0a0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: '100%', position: 'relative'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isActive('/profile') ? 'translateY(-2px)' : 'none',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))'
                }}>
                    <Icon icon="uil:setting" width="32" height="32" />
                </div>
                {isActive('/profile') && <div style={{ position: 'absolute', bottom: 15, width: 4, height: 4, background: 'var(--adm-color-primary)', borderRadius: '50%' }} />}
            </Link>
        </div>
    );
};
