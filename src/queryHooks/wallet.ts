import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet.api';
import { QueryKey } from './_constants';

export const useQueryWallets = () => {
    return useQuery({
        queryKey: [QueryKey.WALLET_LIST],
        queryFn: () => walletApi.getAll(),
    });
};
