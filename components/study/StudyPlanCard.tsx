'use client';

import React from 'react';
import { Trash2, Calendar, BookOpen } from 'lucide-react';
import { StudyPlan } from '@/contexts/StudyContext';
import { Button } from '../ui/Button';
import styles from './StudyPlanCard.module.css';

interface StudyPlanCardProps {
    plan: StudyPlan;
    onView: (plan: StudyPlan) => void;
    onDelete: (id: string) => void;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ plan, onView, onDelete }) => {
    const completedTopics = plan.topicSchedule.filter(t => t.completed).length;
    const totalTopics = plan.topicSchedule.length;
    const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Get main subject title from first topic
    const mainSubjectTitle = plan.topicSchedule[0]?.mainSubjectTitle || 'Study Plan';

    // Get unique subjects for display
    const subjects = [...new Set(plan.topicSchedule.map(t => t.subjectTitle))];
    const primaryColor = plan.topicSchedule[0]?.subjectColor || '#0d9488';

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this study plan?')) {
            onDelete(plan.id);
        }
    };

    return (
        <div
            className={styles.card}
            onClick={() => onView(plan)}
            style={{ '--accent-color': primaryColor } as React.CSSProperties}
        >
            <div className={styles.colorBar} style={{ background: primaryColor }} />

            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper} style={{ background: primaryColor }}>
                        <BookOpen size={20} color="white" />
                    </div>
                    <div className={styles.titles}>
                        <h3 className={styles.planName}>{mainSubjectTitle}</h3>
                        <span className={styles.subjects}>
                            {subjects.length > 2
                                ? `${subjects.slice(0, 2).join(', ')} +${subjects.length - 2}`
                                : subjects.join(', ')
                            }
                        </span>
                    </div>
                    <button className={styles.deleteButton} onClick={handleDelete}>
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className={styles.dateRange}>
                    <Calendar size={16} />
                    <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Progress</span>
                        <span className={styles.progressValue}>{completedTopics}/{totalTopics} topics</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${progressPercentage}%`,
                                background: primaryColor,
                            }}
                        />
                    </div>
                    <span className={styles.progressPercentage}>{progressPercentage}%</span>
                </div>

                <Button
                    variant="outline"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(plan);
                    }}
                >
                    View Calendar
                </Button>
            </div>
        </div>
    );
};
