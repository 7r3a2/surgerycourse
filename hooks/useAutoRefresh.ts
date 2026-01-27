import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTodo } from '@/contexts/TodoContext';

export const useAutoRefresh = (intervalMs: number = 5000) => {
    const { currentUser, logout } = useAuth();
    const { refreshData } = useTodo();

    useEffect(() => {
        if (!currentUser) return;

        const checkStatusAndRefresh = async () => {
            // 1. Check User Session
            try {
                const res = await fetch(`/api/auth/users?id=${currentUser.id}`);
                if (res.status === 404 || res.status === 401) {
                    console.warn('User no longer exists or session invalid. Logging out...');
                    logout();
                    window.location.href = '/login'; // Force redirect
                    return;
                }
            } catch (err) {
                console.error('Error checking user status:', err);
            }

            // 2. Refresh Data (for admin updates)
            if (document.visibilityState === 'visible') {
                try {
                    await refreshData();
                } catch (err) {
                    console.error('Error refreshing data:', err);
                }
            }
        };

        const interval = setInterval(checkStatusAndRefresh, intervalMs);
        return () => clearInterval(interval);
    }, [currentUser, logout, refreshData, intervalMs]);
};
