import { useMutationCreateCategory, useQueryCategories } from '@/queryHooks/useCategory';
import { CategoryType } from '@/types/category.type';
import { Dialog, Picker } from 'antd-mobile';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CategorySelectProps {
    value?: string;
    onChange?: (value: string) => void;
    type: CategoryType;
    placeholder?: string;
    variant?: 'outlined' | 'borderless' | 'filled';
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, type, placeholder }) => {
    const { data: categories } = useQueryCategories();
    const { mutate: createCategory } = useMutationCreateCategory();

    const [visible, setVisible] = useState(false);

    const filteredCategories = categories?.filter((c: any) => c.type === type) || [];
    const columns = [
        [
            ...filteredCategories.map((item: any) => ({ label: item.name, value: item._id })),
            { label: '+ Tạo danh mục mới', value: 'NEW' }
        ]
    ];

    const handleConfirm = async (val: any[]) => {
        const selectedValue = val[0];
        if (selectedValue === 'NEW') {
            const result = window.prompt('Nhập tên danh mục mới:');
            if (result) {
                createCategory({
                    name: result,
                    type: type,
                    icon: 'deployment-unit',
                    color: '#1890ff'
                }, {
                    onSuccess: (newCategory: any) => {
                        toast.success('Thêm danh mục thành công');
                        onChange?.(newCategory._id);
                    },
                    onError: () => {
                        toast.error('Có lỗi xảy ra');
                    }
                });
            }
        } else if (selectedValue) {
            onChange?.(selectedValue);
        }
    };

    const selectedLabel = filteredCategories.find((c: any) => c._id === value)?.name;

    return (
        <div onClick={() => setVisible(true)}>
            <div style={{ color: selectedLabel ? '#1f2c33' : '#cccccc', fontSize: 16 }}>
                {selectedLabel || placeholder || 'Chọn danh mục'}
            </div>
            <Picker
                columns={columns}
                visible={visible}
                onClose={() => setVisible(false)}
                onConfirm={handleConfirm}
                value={[value || '']}
            />
        </div>
    );
};
