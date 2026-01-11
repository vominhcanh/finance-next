
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@api/category.api';
import { CategoryForm } from '@/types/category.type';

export const QUERY_KEY_CATEGORY = 'CATEGORIES';

export const useQueryCategories = () => {
    return useQuery({
        queryKey: [QUERY_KEY_CATEGORY],
        queryFn: () => categoryApi.getAll(),
        placeholderData: (previousData) => previousData,
    });
};

export const useMutationCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CategoryForm) => categoryApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CATEGORY] });
        },
    });
};
