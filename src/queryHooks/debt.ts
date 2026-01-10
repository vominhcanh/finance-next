import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debtApi } from '@api/debt.api';
import { DebtForm, PayInstallmentForm } from '@/types/debt.type';
import { QueryKey } from './_constants';

export const useQueryDebts = (params?: any) => {
    return useQuery({
        queryKey: [QueryKey.DEBT_LIST, params],
        queryFn: () => debtApi.getAll(params),
    });
};

export const useQueryDebt = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: [QueryKey.DEBT, id],
        queryFn: () => debtApi.getOne(id),
        enabled: enabled && !!id,
    });
};

export const useMutateDebt = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: DebtForm) => debtApi.create(data),
        onSuccess: () => {
            // Invalidate list
            queryClient.invalidateQueries({ queryKey: [QueryKey.DEBT_LIST] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DebtForm> }) => debtApi.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.DEBT_LIST] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.DEBT, variables.id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => debtApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.DEBT_LIST] });
        },
    });

    const payInstallmentMutation = useMutation({
        mutationFn: (data: PayInstallmentForm) => debtApi.payInstallment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.DEBT_LIST] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.WALLET_LIST] });
        },
    });

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        payInstallment: payInstallmentMutation,
    };
};
