import { createLazyFileRoute } from '@tanstack/react-router';
import { DebtFormParam } from '@/components/debts/DebtForm';

function DebtDetailPage() {
  const { id } = Route.useParams();
  return <DebtFormParam id={id} mode="view" />;
}

export const Route = createLazyFileRoute('/__layout/debts/$id')({
  component: DebtDetailPage,
});
