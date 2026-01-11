import React, { useState, useRef } from 'react';
import { Select, Divider, Input, Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryCategories, useMutationCreateCategory } from '@/queryHooks/useCategory';
import { CategoryType } from '@/types/category.type';

interface CategorySelectProps {
    value?: string;
    onChange?: (value: string) => void;
    type: CategoryType; // Context for filtering and creating new categories
    placeholder?: string;
    variant?: 'outlined' | 'borderless' | 'filled';
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, type, placeholder, ...props }) => {
    const { data: categories } = useQueryCategories();
    const { mutate: createCategory, isPending } = useMutationCreateCategory();

    const [name, setName] = useState('');
    const inputRef = useRef<any>(null);

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        createCategory({
            name: name,
            type: type, // Use the current transaction type context
            icon: 'deployment-unit', // Default icon
            color: '#1890ff' // Default color
        }, {
            onSuccess: (newCategory) => {
                message.success('Category added successfully');
                setName('');
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 0);
                // Auto-select the new category
                if (onChange) {
                    onChange(newCategory._id);
                }
            },
            onError: () => {
                message.error('Failed to add category');
            }
        });
    };

    const filteredCategories = categories?.filter(c => c.type === type) || [];

    return (
        <Select
            style={{ width: '100%' }}
            placeholder={placeholder || 'Select Category'}
            value={value}
            onChange={onChange}
            size="small"
            dropdownRender={(menu) => (
                <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', gap: 8, padding: '0 8px 4px' }}>
                        <Input
                            placeholder="Nhập danh mục"
                            ref={inputRef}
                            value={name}
                            size="small"
                            onChange={onNameChange}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 7 }}
                        />
                        <Button size="small" type="primary" icon={<PlusOutlined />} onClick={addItem} loading={isPending} style={{ flex: 3 }}>
                            Tạo
                        </Button>
                    </div>
                </>
            )}
            options={filteredCategories.map((item) => ({ label: item.name, value: item._id }))}
        />
    );
};
