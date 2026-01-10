import { createLazyFileRoute } from '@tanstack/react-router';
import { WalletList } from '@components/wallets/WalletList';

export const Route = createLazyFileRoute('/__layout/wallets')({
    component: WalletList,
});
