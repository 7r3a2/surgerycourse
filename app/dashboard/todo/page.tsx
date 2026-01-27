'use client';

import React, { useState } from 'react';
import { Layers, CheckCircle, ListTodo } from 'lucide-react';
import { useTodo } from '@/contexts/TodoContext';
import { MainSubjectCard } from '@/components/todo/MainSubjectCard';
import { BackButton } from '@/components/ui/BackButton';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Card } from '@/components/ui/Card';
import styles from './page.module.css';

export default function TodoPage() {
    const { mainSubjects, toggleTopic, getTotalProgress, getMainSubjectProgress } = useTodo();
    const [progressFilterSubjectId, setProgressFilterSubjectId] = useState<string>('all');
    const [localMainSubjects, setLocalMainSubjects] = useState(mainSubjects);

    // Update local state when mainSubjects changes
    React.useEffect(() => {
        setLocalMainSubjects(mainSubjects);
    }, [mainSubjects]);

    const progress = progressFilterSubjectId === 'all'
        ? getTotalProgress()
        : getMainSubjectProgress(progressFilterSubjectId);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <BackButton />
                    <div>
                        <h1 className={styles.title}>To-Do List</h1>
                        <p className={styles.subtitle}>Manage your curriculum and track progress</p>
                    </div>
                </div>
            </div>

            {mainSubjects.length > 0 && (
                <div className={styles.topSection}>
                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <Card variant="bordered">
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                                    <Layers size={24} color="white" />
                                </div>
                                <div>
                                    <div className={styles.statLabel}>Main Subjects</div>
                                    <div className={styles.statValue}>{mainSubjects.length}</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="bordered">
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                                    <ListTodo size={24} color="white" />
                                </div>
                                <div>
                                    <div className={styles.statLabel}>Total Topics</div>
                                    <div className={styles.statValue}>{progress.total}</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="bordered">
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                                    <CheckCircle size={24} color="white" />
                                </div>
                                <div>
                                    <div className={styles.statLabel}>Completion</div>
                                    <div className={styles.statValue}>{Math.round(progress.percentage)}%</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Progress Control Section - Redesigned & Enhanced */}
                    <div className={styles.progressSection}>
                        <Card variant="bordered" className={styles.progressControlCard}>
                            <div className={styles.progressFlex}>
                                <div className={styles.circularWrapper}>
                                    <CircularProgress percentage={progress.percentage} size={150} strokeWidth={12} />
                                </div>
                                <div className={styles.progressMeta}>
                                    <div className={styles.progressLabel}>
                                        {progressFilterSubjectId === 'all' ? 'Overall Progress' : 'Subject Progress'}
                                    </div>

                                    <div className={styles.selectWrapper}>
                                        <select
                                            className={styles.modernSelect}
                                            value={progressFilterSubjectId}
                                            onChange={(e) => setProgressFilterSubjectId(e.target.value)}
                                        >
                                            <option value="all">All Subjects</option>
                                            {mainSubjects.map(ms => (
                                                <option key={ms.id} value={ms.id}>{ms.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.progressStats}>
                                        <div className={styles.statBox}>
                                            <span className={styles.statBoxValue} style={{ color: '#10b981' }}>{progress.completed}</span>
                                            <span className={styles.statBoxLabel}>Done</span>
                                        </div>
                                        <div className={styles.statDivider}></div>
                                        <div className={styles.statBox}>
                                            <span className={styles.statBoxValue} style={{ color: '#6b7280' }}>{progress.total - progress.completed}</span>
                                            <span className={styles.statBoxLabel}>Left</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {mainSubjects.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No subjects available yet. Please wait for admin to add subjects.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {localMainSubjects.map((mainSubject) => (
                        <div key={mainSubject.id}>
                            <MainSubjectCard
                                mainSubject={mainSubject}
                                onAddSubject={() => { }}
                                onDelete={() => { }}
                                onAddTopic={() => { }}
                                onDeleteSubject={() => { }}
                                onToggleTopic={(subjectId, topicId) => toggleTopic(mainSubject.id, subjectId, topicId)}
                                onDeleteTopic={() => { }}
                                onReorderSubjects={() => { }}
                                onReorderTopics={() => { }}
                                onUpdateTopic={() => { }}
                                progress={getMainSubjectProgress(mainSubject.id)}
                                isEditMode={false}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
