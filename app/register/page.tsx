'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../login/page.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const { register, currentUser, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isLoading && currentUser) {
            router.push('/dashboard');
        }
    }, [currentUser, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await register(username, password);
        if (result.success) {
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } else {
            setError(result.error || 'Registration failed');
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

                <h2 className={styles.title}>Create Account</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    {success && (
                        <div className={styles.error} style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            color: '#34d399'
                        }}>
                            {success}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        <UserPlus size={20} />
                        Create Account
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
}
