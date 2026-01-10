import { createLazyFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@components/profile/ProfilePage';

export const Route = createLazyFileRoute('/__layout/profile')({
    component: ProfilePage,
});
