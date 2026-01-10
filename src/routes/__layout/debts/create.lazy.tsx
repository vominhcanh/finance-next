import { createLazyFileRoute } from '@tanstack/react-router';
import { DebtFormParam } from '@/components/debts/DebtForm';

export const Route = createLazyFileRoute('/__layout/debts/create')({
    component() {
        return <DebtFormParam mode="create" />;
    },
});
