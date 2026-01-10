import { createLazyFileRoute } from '@tanstack/react-router';
import { BudgetList } from '@components/budgets/BudgetList';

export const Route = createLazyFileRoute('/__layout/budgets')({
    component: BudgetList,
});
