'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import { useStudy, StudyPlan } from '@/contexts/StudyContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { AddStudyPlanModal } from '@/components/study/AddStudyPlanModal';
import { StudyPlanCard } from '@/components/study/StudyPlanCard';
import { StudyPlanCalendar } from '@/components/study/StudyPlanCalendar';
import styles from './page.module.css';

export default function StudyPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
    const { studyPlans, deleteStudyPlan, isLoading } = useStudy();

    const handleViewPlan = (plan: StudyPlan) => {
        setSelectedPlan(plan);
    };

    const handleClosePlan = () => {
        setSelectedPlan(null);
    };

    const handleDeletePlan = (id: string) => {
        deleteStudyPlan(id);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading study plans...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <BackButton />
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <BookOpen size={32} />
                        Study It
                    </h1>
                    <p className={styles.subtitle}>
                        Plan your study sessions and track your reading progress
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsAddModalOpen(true)}
                    icon={<Plus size={20} />}
                >
                    Add Study Plan
                </Button>
            </header>

            {studyPlans.length === 0 ? (
                <Card variant="bordered" className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                        <div className={styles.emptyIcon}>
                            <Calendar size={64} />
                        </div>
                        <h2 className={styles.emptyTitle}>No Study Plans Yet</h2>
                        <p className={styles.emptyDescription}>
                            Create your first study plan by selecting a subject and date range.
                            Topics will be automatically distributed across your study days.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus size={20} />}
                        >
                            Create Study Plan
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className={styles.plansGrid}>
                    {studyPlans.map(plan => (
                        <StudyPlanCard
                            key={plan.id}
                            plan={plan}
                            onView={handleViewPlan}
                            onDelete={handleDeletePlan}
                        />
                    ))}
                </div>
            )}

            {/* Add Study Plan Modal */}
            <AddStudyPlanModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPlanCreated={handleViewPlan}
            />

            {/* Study Plan Calendar View */}
            {selectedPlan && (
                <StudyPlanCalendar
                    plan={selectedPlan}
                    onClose={handleClosePlan}
                />
            )}
        </div>
    );
}
