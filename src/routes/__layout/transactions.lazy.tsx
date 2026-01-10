import { createLazyFileRoute } from '@tanstack/react-router';
import { TransactionList } from '@components/transactions/TransactionList';

export const Route = createLazyFileRoute('/__layout/transactions')({
    component: TransactionList,
});
