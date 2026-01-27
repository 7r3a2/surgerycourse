'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './BackButton.module.css';

interface BackButtonProps {
    href?: string;
    label?: string;
}

export function BackButton({ href = '/dashboard', label = 'Back to Overview' }: BackButtonProps) {
    return (
        <Link href={href} className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>{label}</span>
        </Link>
    );
}
