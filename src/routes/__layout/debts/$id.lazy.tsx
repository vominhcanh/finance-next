import { createLazyFileRoute } from '@tanstack/react-router';
import { DebtFormParam } from '@/components/debts/DebtForm';

export const Route = createLazyFileRoute('/__layout/debts/$id')({
  component() {
    const { id } = Route.useParams();
    return <DebtFormParam id={id} mode="view" />;
  },
});
