import { useEffect, useState } from 'react';

export function useMedia(query: string, defaultState: boolean = false) {
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') return defaultState;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        let mounted = true;
        const mql = window.matchMedia(query);
        const onChange = () => {
            if (!mounted) return;
            setState(!!mql.matches);
        };

        mql.addEventListener('change', onChange);

        return () => {
            mounted = false;
            mql.removeEventListener('change', onChange);
        };
    }, [query]);

    return state;
}
