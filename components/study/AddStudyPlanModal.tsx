'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodo, Topic } from '@/contexts/TodoContext';
import { useStudy, StudyPlan } from '@/contexts/StudyContext';
import styles from './AddStudyPlanModal.module.css';

interface AddStudyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlanCreated?: (plan: StudyPlan) => void;
}

interface SelectedTopic {
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectTitle: string;
    mainSubjectId: string;
    mainSubjectTitle: string;
    subjectColor: string;
}

export const AddStudyPlanModal: React.FC<AddStudyPlanModalProps> = ({ isOpen, onClose, onPlanCreated }) => {
    const [selectedMainSubjectId, setSelectedMainSubjectId] = useState('');
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<SelectedTopic[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { mainSubjects } = useTodo();
    const { addStudyPlan } = useStudy();

    // Get subjects for selected main subject
    const availableSubjects = useMemo(() => {
        if (!selectedMainSubjectId) return [];
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        return mainSubject?.subjects || [];
    }, [selectedMainSubjectId, mainSubjects]);

    // Get all topics from selected subjects
    const availableTopics = useMemo(() => {
        if (!selectedMainSubjectId || selectedSubjectIds.length === 0) return [];
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        if (!mainSubject) return [];

        const topics: Array<Topic & { subjectId: string; subjectTitle: string; subjectColor: string }> = [];

        selectedSubjectIds.forEach(subjectId => {
            const subject = mainSubject.subjects.find(s => s.id === subjectId);
            if (subject) {
                subject.topics.forEach(topic => {
                    topics.push({
                        ...topic,
                        subjectId: subject.id,
                        subjectTitle: subject.title,
                        subjectColor: subject.color,
                    });
                });
            }
        });

        return topics;
    }, [selectedMainSubjectId, selectedSubjectIds, mainSubjects]);

    // Calculate distribution preview
    const distributionPreview = useMemo(() => {
        if (!selectedTopics.length || !startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) return null;

        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const topicsCount = selectedTopics.length;
        const topicsPerDay = topicsCount > 0 ? (topicsCount / daysDiff).toFixed(1) : '0';

        return {
            topics: topicsCount,
            days: daysDiff,
            topicsPerDay,
        };
    }, [selectedTopics, startDate, endDate]);

    const handleMainSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMainSubjectId(e.target.value);
        setSelectedSubjectIds([]);
        setSelectedTopics([]);
    };

    const handleSubjectToggle = (subjectId: string) => {
        setSelectedSubjectIds(prev => {
            if (prev.includes(subjectId)) {
                // Remove subject and its topics
                setSelectedTopics(topics => topics.filter(t => t.subjectId !== subjectId));
                return prev.filter(id => id !== subjectId);
            } else {
                return [...prev, subjectId];
            }
        });
    };

    const handleTopicToggle = (topic: Topic & { subjectId: string; subjectTitle: string; subjectColor: string }) => {
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        if (!mainSubject) return;

        setSelectedTopics(prev => {
            const exists = prev.find(t => t.topicId === topic.id);
            if (exists) {
                return prev.filter(t => t.topicId !== topic.id);
            } else {
                return [...prev, {
                    topicId: topic.id,
                    topicTitle: topic.title,
                    subjectId: topic.subjectId,
                    subjectTitle: topic.subjectTitle,
                    mainSubjectId: selectedMainSubjectId,
                    mainSubjectTitle: mainSubject.title,
                    subjectColor: topic.subjectColor,
                }];
            }
        });
    };

    const handleSelectAllTopics = () => {
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        if (!mainSubject) return;

        if (selectedTopics.length === availableTopics.length) {
            setSelectedTopics([]);
        } else {
            setSelectedTopics(availableTopics.map(topic => ({
                topicId: topic.id,
                topicTitle: topic.title,
                subjectId: topic.subjectId,
                subjectTitle: topic.subjectTitle,
                mainSubjectId: selectedMainSubjectId,
                mainSubjectTitle: mainSubject.title,
                subjectColor: topic.subjectColor,
            })));
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTopics.length > 0 && startDate && endDate) {
            setIsSubmitting(true);
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start <= end) {
                const newPlan = await addStudyPlan(selectedTopics, start, end);
                setIsSubmitting(false);
                handleClose();
                if (newPlan && onPlanCreated) {
                    onPlanCreated(newPlan);
                }
            } else {
                setIsSubmitting(false);
            }
        }
    };

    const handleClose = () => {
        setSelectedMainSubjectId('');
        setSelectedSubjectIds([]);
        setSelectedTopics([]);
        setStartDate('');
        setEndDate('');
        onClose();
    };

    // Set default dates
    const today = new Date().toISOString().split('T')[0];

    const isFormValid = selectedTopics.length > 0 && startDate && endDate && new Date(startDate) <= new Date(endDate);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="📚 Create Study Plan">
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Step 1: Select Main Subject */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <span className={styles.stepNumber}>1</span>
                        Choose Main Subject
                    </h4>

                    <div className={styles.field}>
                        <select
                            id="main-subject"
                            value={selectedMainSubjectId}
                            onChange={handleMainSubjectChange}
                            className={styles.select}
                        >
                            <option value="">Select a main subject...</option>
                            {mainSubjects.map((mainSubject) => (
                                <option key={mainSubject.id} value={mainSubject.id}>
                                    {mainSubject.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Step 2: Select Subjects (multiple) */}
                {selectedMainSubjectId && availableSubjects.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>2</span>
                            Select Subjects
                            <span className={styles.selectedCount}>
                                ({selectedSubjectIds.length} selected)
                            </span>
                        </h4>

                        <div className={styles.subjectsList}>
                            {availableSubjects.map((subject) => (
                                <label
                                    key={subject.id}
                                    className={`${styles.subjectItem} ${selectedSubjectIds.includes(subject.id) ? styles.selectedSubject : ''}`}
                                    style={{ borderLeftColor: subject.color }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjectIds.includes(subject.id)}
                                        onChange={() => handleSubjectToggle(subject.id)}
                                        className={styles.checkbox}
                                    />
                                    <div className={styles.subjectInfo}>
                                        <span className={styles.subjectName}>{subject.title}</span>
                                        <span className={styles.topicCount}>{subject.topics.length} topics</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Select Topics */}
                {selectedSubjectIds.length > 0 && availableTopics.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>3</span>
                            Select Topics
                            <span className={styles.selectedCount}>
                                ({selectedTopics.length}/{availableTopics.length})
                            </span>
                        </h4>

                        <button
                            type="button"
                            className={styles.selectAllBtn}
                            onClick={handleSelectAllTopics}
                        >
                            {selectedTopics.length === availableTopics.length ? '✓ Deselect All' : '☐ Select All'}
                        </button>

                        <div className={styles.topicsList}>
                            {availableTopics.map((topic) => (
                                <label
                                    key={topic.id}
                                    className={`${styles.topicItem} ${selectedTopics.find(t => t.topicId === topic.id) ? styles.selectedTopic : ''}`}
                                    style={{ borderLeftColor: topic.subjectColor }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedTopics.find(t => t.topicId === topic.id)}
                                        onChange={() => handleTopicToggle(topic)}
                                        className={styles.checkbox}
                                    />
                                    <div className={styles.topicInfo}>
                                        <span className={topic.completed ? styles.completedTopic : ''}>{topic.title}</span>
                                        <span className={styles.topicSubject}>{topic.subjectTitle}</span>
                                    </div>
                                    {topic.completed && (
                                        <span className={styles.completedBadge}>✓</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Date Range */}
                {selectedTopics.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>4</span>
                            Set Date Range
                        </h4>

                        <div className={styles.dateRange}>
                            <div className={styles.field}>
                                <label htmlFor="start-date" className={styles.label}>
                                    Start Date
                                </label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={styles.input}
                                    min={today}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="end-date" className={styles.label}>
                                    End Date
                                </label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={styles.input}
                                    min={startDate || today}
                                />
                            </div>
                        </div>

                        {distributionPreview && (
                            <div className={styles.preview}>
                                <div className={styles.previewStats}>
                                    <div className={styles.previewStat}>
                                        <span className={styles.statValue}>{distributionPreview.topics}</span>
                                        <span className={styles.statLabel}>Topics</span>
                                    </div>
                                    <div className={styles.previewDivider}>→</div>
                                    <div className={styles.previewStat}>
                                        <span className={styles.statValue}>{distributionPreview.days}</span>
                                        <span className={styles.statLabel}>Days</span>
                                    </div>
                                    <div className={styles.previewDivider}>=</div>
                                    <div className={styles.previewStat}>
                                        <span className={styles.statValue}>~{distributionPreview.topicsPerDay}</span>
                                        <span className={styles.statLabel}>per day</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mainSubjects.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No subjects available. Please create subjects in the To-Do List first.</p>
                    </div>
                )}

                <div className={styles.buttons}>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Study Plan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
