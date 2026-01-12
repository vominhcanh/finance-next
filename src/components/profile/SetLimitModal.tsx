import { userApi } from '@/api/user.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, InputNumber, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SetLimitModalProps {
    open: boolean;
    onClose: () => void;
    currentLimit?: number;
}

export const SetLimitModal = ({ open, onClose, currentLimit = 0 }: SetLimitModalProps) => {
    const [limit, setLimit] = useState<number>(currentLimit);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (open) {
            setLimit(currentLimit);
        }
    }, [open, currentLimit]);

    const { mutate, isPending } = useMutation({
        mutationFn: (amount: number) => userApi.updateMonthlyLimit(amount),
        onSuccess: () => {
            toast.success('Đã cập nhật hạn mức chi tiêu thành công');
            // Refresh spending warning and profile
            queryClient.invalidateQueries({ queryKey: ['spendingWarning'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onClose();
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi cập nhật hạn mức');
        }
    });

    const handleSave = () => {
        if (limit < 0) {
            toast.error('Hạn mức không hợp lệ');
            return;
        }
        mutate(limit);
    };

    return (
        <Modal
            title="Thiết lập Hạn Mức Chi Tiêu"
            open={open}
            onCancel={onClose}
            footer={[
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button key="cancel" onClick={onClose} block>
                        Hủy
                    </Button>
                    <Button
                        key="save"
                        type="primary"
                        loading={isPending}
                        onClick={handleSave}
                        block
                    >
                        Lưu hạn mức
                    </Button>
                </div>
            ]}
            centered
        >
            <div style={{ paddingTop: 12, paddingBottom: 12 }}>
                <p style={{ marginBottom: 16, color: '#595959', fontStyle: 'italic' }}>
                    Nhập số tiền bạn muốn giới hạn chi tiêu trong tháng. Hệ thống sẽ cảnh báo khi bạn chi tiêu sắp vượt quá giới hạn này.
                </p>
                <InputNumber
                    style={{ width: '100%', height: 45, fontSize: 16, paddingTop: 6 }}
                    value={limit}
                    onChange={(val) => setLimit(val || 0)}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    placeholder="Nhập số tiền (VD: 20,000,000)"
                    min={0}
                    size="middle"
                />

                <div style={{ marginTop: 12, fontSize: 13, color: 'red', fontStyle: 'italic' }}>
                    *Hạn mức này sẽ áp dụng cho tất cả các tháng. Chi tiêu sẽ tự động reset vào ngày đầu tháng.
                </div>
            </div>
        </Modal>
    );
};
