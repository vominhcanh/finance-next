import { Spin } from 'antd';

export const LoadingSpinner = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        }}>
            <Spin size="large" />
        </div>
    );
};
