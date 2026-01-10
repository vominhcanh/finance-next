import { atom } from 'recoil';

// Global loading state
export const loadingAtom = atom<boolean>({
    key: 'loading',
    default: false,
});

// Active bottom navigation tab
export const activeTabAtom = atom<string>({
    key: 'activeTab',
    default: 'home',
});
