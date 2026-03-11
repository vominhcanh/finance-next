import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import { Empty, Space } from 'antd-mobile';

export const BudgetList = () => {
    return (
        <Space direction="vertical" block style={{ padding: 12, paddingBottom: 150, background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.history.back()}>
                    <ArrowRightOutlined rotate={180} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2c33' }}>Quản lý ngân sách</div>
                <div style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusOutlined />
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 16px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Chưa có ngân sách nào" />
            </div>
        </Space>
    );
};
