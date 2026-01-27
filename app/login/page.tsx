'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, currentUser, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && currentUser) {
            router.push('/dashboard');
        }
    }, [currentUser, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = await login(username, password);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (currentUser) {
        return null; // Will redirect
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logoSection}>
                    <Image
                        src="/logo.jpg"
                        alt="Mustansiriya University"
                        width={120}
                        height={120}
                        className={styles.logo}
                        priority
                    />
                    <h1 className={styles.welcomeText}>Welcome to Surgery Course</h1>
                    <p className={styles.subtitle}>By Haider Alaa</p>
                </div>

                <h2 className={styles.title}>Sign In</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        <LogIn size={20} />
                        Sign In
                    </button>
                </form>

                <div className={styles.footer}>
                    Don&apos;t have an account? <Link href="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}
