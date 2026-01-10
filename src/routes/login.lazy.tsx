import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@components/auth/LoginForm';

export const Route = createLazyFileRoute('/login')({
    component: LoginForm,
});
