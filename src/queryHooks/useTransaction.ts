
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@api/transaction.api';
import { TransactionForm, TransactionQueryParams } from '@/types/transaction.type';
import { message } from 'antd';

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
            message.success('Tạo giao dịch thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            // Invalidate wallets to update balance
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TransactionForm> }) =>
            transactionApi.update(id, data),
        onSuccess: () => {
            message.success('Cập nhật thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const remove = useMutation({
        mutationFn: (id: string) => transactionApi.delete(id),
        onSuccess: () => {
            message.success('Xóa thành công');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TRANSACTION] });
            queryClient.invalidateQueries({ queryKey: ['WALLETS'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    return { create, update, remove };
};
