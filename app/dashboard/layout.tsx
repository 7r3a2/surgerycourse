'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DeviceWarning } from '@/components/ui/DeviceWarning';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { currentUser, isLoading, isAdmin } = useAuth();

    // Enable auto-refresh for session and data
    useAutoRefresh(5000);

    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isLoading, router]);

    if (isLoading) {
        return (
            <div className={styles.layout}>
                <main className={styles.main}>
                    <div className={styles.content}>
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!currentUser) {
        return null; // Will redirect
    }

    return (
        <DeviceWarning isAdmin={isAdmin}>
            <div className={styles.layout}>
                {/* Main Content - No sidebar */}
                <main className={styles.main}>
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </DeviceWarning>
    );
}

