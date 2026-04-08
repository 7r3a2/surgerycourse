'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckSquare, BookOpen, Calendar, TrendingUp, ArrowRight, LogOut, Shield, User, GraduationCap } from 'lucide-react';
import { useTodo } from '@/contexts/TodoContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './page.module.css';

export default function DashboardPage() {
    const { mainSubjects, getTotalProgress } = useTodo();
    const { currentUser, isAdmin, logout } = useAuth();
    const totalProgress = getTotalProgress();
    const totalSubjects = mainSubjects?.reduce((acc, ms) => acc + ms.subjects.length, 0) || 0;

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logoContainer}>
                        <Image
                            src="/logo.jpg"
                            alt="Mustansiriya University"
                            width={50}
                            height={50}
                            className={styles.logo}
                        />
                    </div>
                    <div>
                        <h1 className={styles.title}>Surgery Course</h1>
                        <p className={styles.subtitle}>Welcome back, <strong>{currentUser?.username}</strong>! Here's your learning overview.</p>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.userBadge}>
                        <User size={16} />
                        <span>{currentUser?.username}</span>
                        {isAdmin && (
                            <span className={styles.adminBadge}>
                                <Shield size={12} />
                                Admin
                            </span>
                        )}
                    </div>
                    <Button variant="outline" onClick={handleLogout} icon={<LogOut size={16} />}>
                        Logout
                    </Button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className={styles.stats}>
                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                            <CheckSquare size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Total Subjects</div>
                            <div className={styles.statValue}>{totalSubjects}</div>
                        </div>
                    </div>
                </Card>

                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Total Topics</div>
                            <div className={styles.statValue}>{totalProgress.total}</div>
                        </div>
                    </div>
                </Card>

                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                            <CheckSquare size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Completed</div>
                            <div className={styles.statValue}>{totalProgress.completed}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Overall Progress */}
            <Card variant="bordered" className={styles.progressCard}>
                <h2 className={styles.cardTitle}>Overall Progress</h2>
                <div className={styles.progressSection}>
                    <div className={styles.progressInfo}>
                        <span>{totalProgress.completed} of {totalProgress.total} topics completed</span>
                    </div>
                    <ProgressBar percentage={totalProgress.percentage} height="large" />
                </div>
            </Card>

            {/* Navigation Cards */}
            <div className={styles.features}>
                <Card hover variant="glass" className={styles.featureCard}>
                    <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                        <CheckSquare size={40} color="white" />
                    </div>
                    <h3>To-Do List</h3>
                    <p>View your subjects and topics. Track your learning progress.</p>
                    <Link href="/dashboard/todo">
                        <Button variant="primary" icon={<ArrowRight size={16} />}>
                            Open To-Do
                        </Button>
                    </Link>
                </Card>

                <Card hover variant="glass" className={styles.featureCard}>
                    <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                        <Calendar size={40} color="white" />
                    </div>
                    <h3>Calendar</h3>
                    <p>Plan your study schedule. Set due dates and track deadlines.</p>
                    <Link href="/dashboard/calendar">
                        <Button variant="primary" icon={<ArrowRight size={16} />}>
                            View Calendar
                        </Button>
                    </Link>
                </Card>

                <Card hover variant="glass" className={styles.featureCard}>
                    <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>
                        <BookOpen size={40} color="white" />
                    </div>
                    <h3>Study It</h3>
                    <p>Create study plans and organize your reading sessions.</p>
                    <Link href="/dashboard/study">
                        <Button variant="primary" icon={<ArrowRight size={16} />}>
                            Start Studying
                        </Button>
                    </Link>
                </Card>

                <Card hover variant="glass" className={styles.featureCard}>
                    <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)' }}>
                        <GraduationCap size={40} color="white" />
                    </div>
                    <h3>Final Exams</h3>
                    <p>Plan your study before each final exam and track progress day by day.</p>
                    <Link href="/dashboard/final-exams">
                        <Button variant="primary" icon={<ArrowRight size={16} />}>
                            Open Exams
                        </Button>
                    </Link>
                </Card>

                {isAdmin && (
                    <Card hover variant="glass" className={styles.featureCard}>
                        <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' }}>
                            <Shield size={40} color="white" />
                        </div>
                        <h3>Admin Dashboard</h3>
                        <p>Manage users and system settings. Admin only access.</p>
                        <Link href="/dashboard/admin">
                            <Button variant="primary" icon={<ArrowRight size={16} />}>
                                Open Admin
                            </Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}
