import { User } from '@/types/auth.type';
import { Nullable } from '@/types/global.type';
import { atom } from 'recoil';

// Auth token atom
export const authTokenAtom = atom<Nullable<string>>({
    key: 'authToken',
    default: localStorage.getItem('access_token') || null,
    effects: [
        ({ onSet }) => {
            onSet((newValue) => {
                if (newValue) {
                    localStorage.setItem('access_token', newValue);
                } else {
                    localStorage.removeItem('access_token');
                }
            });
        },
    ],
});

// Current user atom
export const currentUserAtom = atom<Nullable<User>>({
    key: 'currentUser',
    default: null,
});

// Is authenticated derived atom
export const isAuthenticatedAtom = atom<boolean>({
    key: 'isAuthenticated',
    default: !!localStorage.getItem('access_token'),
});
