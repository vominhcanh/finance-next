import { createLazyFileRoute } from '@tanstack/react-router';
import { DebtList } from '@components/debts/DebtList';

export const Route = createLazyFileRoute('/__layout/debts/')({
    component: DebtList,
});
