import { Card, Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const BudgetList = () => {
    return (
        <div className="budget-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý ngân sách</h2>
                <Button type="primary" icon={<PlusOutlined />}>
                    Thêm ngân sách
                </Button>
            </div>

            <Card>
                <Table
                    dataSource={[]}
                    columns={[
                        { title: 'Tên ngân sách', dataIndex: 'name', key: 'name' },
                        { title: 'Số tiền', dataIndex: 'amount', key: 'amount' },
                        { title: 'Đã chi', dataIndex: 'spent', key: 'spent' },
                        { title: 'Còn lại', dataIndex: 'remaining', key: 'remaining' },
                    ]}
                    locale={{ emptyText: 'Chưa có ngân sách nào' }}
                />
            </Card>
        </div>
    );
};
