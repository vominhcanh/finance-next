import { createLazyFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@components/dashboard/Dashboard';

export const Route = createLazyFileRoute('/__layout/')({
    component: Dashboard,
});
