import { userApi } from '@/api/user.api';
import { formatCurrency } from '@/utils/format.utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, NumberKeyboard, Popup, VirtualInput } from 'antd-mobile';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface SetLimitModalProps {
    open: boolean;
    onClose: () => void;
    currentLimit?: number;
}

export const SetLimitModal = ({ open, onClose, currentLimit = 0 }: SetLimitModalProps) => {
    const [limit, setLimit] = useState<string>(currentLimit.toString());
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (open) {
            setLimit(currentLimit ? currentLimit.toString() : '');
        }
    }, [open, currentLimit]);

    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setKeyboardVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const { mutate, isPending } = useMutation({
        mutationFn: (amount: number) => userApi.updateMonthlyLimit(amount),
        onSuccess: () => {
            toast.success('Đã cập nhật hạn mức chi tiêu thành công');
            queryClient.invalidateQueries({ queryKey: ['spendingWarning'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onClose();
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi cập nhật hạn mức');
        }
    });

    const handleSave = () => {
        const numLimit = parseInt(limit, 10);
        if (isNaN(numLimit) || numLimit < 0) {
            toast.error('Hạn mức không hợp lệ');
            return;
        }
        mutate(numLimit);
    };

    return (
        <Popup
            visible={open}
            onMaskClick={onClose}
            bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: '35vh' }}
        >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                Thiết lập Hạn Mức Chi Tiêu
            </div>
            
            <div style={{ paddingTop: 12, paddingBottom: 12 }}>
                <p style={{ marginBottom: 16, color: '#595959', fontStyle: 'italic', fontSize: 14 }}>
                    Nhập số tiền bạn muốn giới hạn chi tiêu trong tháng. Hệ thống sẽ cảnh báo khi bạn chi tiêu sắp vượt quá giới hạn này.
                </p>
                
                <div ref={inputRef} style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
                    <VirtualInput
                        placeholder="Nhập số tiền (VD: 20,000,000)"
                        value={limit ? formatCurrency(parseFloat(limit)).replace('đ', '').trim() : ''}
                        onFocus={() => setKeyboardVisible(true)}
                        clearable
                        onClear={() => setLimit('')}
                        style={{ '--font-size': '18px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                    />
                    <NumberKeyboard
                        visible={keyboardVisible}
                        onClose={() => setKeyboardVisible(false)}
                        onInput={(v) => setLimit((prev) => (prev || '') + v)}
                        onDelete={() => setLimit((prev) => (prev || '').toString().slice(0, -1))}
                    />
                </div>

                <div style={{ fontSize: 13, color: 'red', fontStyle: 'italic', marginBottom: 24 }}>
                    *Hạn mức này sẽ áp dụng cho tất cả các tháng. Chi tiêu sẽ tự động reset vào ngày đầu tháng.
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <Button onClick={onClose} block style={{ borderRadius: 8, flex: 1 }}>
                        Hủy
                    </Button>
                    <Button
                        color="primary"
                        loading={isPending}
                        onClick={handleSave}
                        block
                        style={{ borderRadius: 8, flex: 1 }}
                    >
                        Lưu hạn mức
                    </Button>
                </div>
            </div>
        </Popup>
    );
};
