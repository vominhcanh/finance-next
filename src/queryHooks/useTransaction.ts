import { TransactionForm, TransactionQueryParams } from '@/types/transaction.type';
import { transactionApi } from '@api/transaction.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const QUERY_KEY_TRANSACTION = 'TRANSACTIONS';

export const useQueryTransactions = (params?: TransactionQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEY_TRANSACTION, params],
        queryFn: () => transactionApi.getAll(params),
        placeholderData: (previousData) => previousData,
    });
};

export const useMutateTransaction = () => {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: (data: TransactionForm) => transactionApi.create(data),
        onSuccess: () => {
            toast.success('Tạo giao dịch thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            // Invalidate wallets to update balance
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TransactionForm> }) =>
            transactionApi.update(id, data),
        onSuccess: () => {
            toast.success('Cập nhật thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const remove = useMutation({
        mutationFn: (id: string) => transactionApi.delete(id),
        onSuccess: () => {
            toast.success('Xóa thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    return { create, update, remove };
};
