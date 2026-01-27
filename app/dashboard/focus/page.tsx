'use client';

import { useFocus } from '@/contexts/FocusContext';
import { TimerSetup } from '@/components/focus/TimerSetup';
import { TimerDisplay } from '@/components/focus/TimerDisplay';
import styles from './page.module.css';

export default function FocusPage() {
    const { isActive } = useFocus();

    return (
        <div className={styles.container}>
            {!isActive ? (
                <TimerSetup />
            ) : (
                <div className={styles.layout}>
                    <TimerDisplay />
                </div>
            )}
        </div>
    );
}
