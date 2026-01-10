import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/__layout/debts')({
    component: DebtsLayout,
});

function DebtsLayout() {
    return <Outlet />;
}
