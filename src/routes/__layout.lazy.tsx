import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';

export const Route = createLazyFileRoute('/__layout')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <PrivateRoute>
      <MobileLayout>
        <Outlet />
      </MobileLayout>
    </PrivateRoute>
  );
}
