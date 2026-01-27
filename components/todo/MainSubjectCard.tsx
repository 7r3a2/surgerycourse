'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { MainSubject, Subject } from '@/contexts/TodoContext';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SubjectCard } from './SubjectCard';
import styles from './MainSubjectCard.module.css';

interface MainSubjectCardProps {
    mainSubject: MainSubject;
    onAddSubject: () => void;
    onDelete: () => void;
    onAddTopic: (subjectId: string) => void;
    onDeleteSubject: (subjectId: string) => void;
    onToggleTopic: (subjectId: string, topicId: string) => void;
    onDeleteTopic: (subjectId: string, topicId: string) => void;
    onReorderSubjects?: (reorderedSubjects: Subject[]) => void;
    onReorderTopics?: (subjectId: string, reorderedTopics: any[]) => void;
    onUpdateTopic?: (subjectId: string, topicId: string, newTitle: string) => void;
    progress: { completed: number; total: number; percentage: number };
    isEditMode: boolean;
}

export const MainSubjectCard: React.FC<MainSubjectCardProps> = ({
    mainSubject,
    onAddSubject,
    onDelete,
    onAddTopic,
    onDeleteSubject,
    onToggleTopic,
    onDeleteTopic,
    onReorderSubjects,
    onReorderTopics,
    onUpdateTopic,
    progress,
    isEditMode,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localSubjects, setLocalSubjects] = useState(mainSubject.subjects);
    const [draggedSubjectIndex, setDraggedSubjectIndex] = useState<number | null>(null);

    // Update local state when mainSubject changes
    React.useEffect(() => {
        setLocalSubjects(mainSubject.subjects);
    }, [mainSubject.subjects]);

    const handleSubjectDragStart = (index: number) => (e: React.DragEvent) => {
        setDraggedSubjectIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSubjectDragEnd = () => {
        if (draggedSubjectIndex !== null && localSubjects.length > 0 && onReorderSubjects) {
            // Save to database
            onReorderSubjects(localSubjects);
        }
        setDraggedSubjectIndex(null);
    };

    const handleSubjectDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedSubjectIndex === null || draggedSubjectIndex === index) return;

        const items = [...localSubjects];
        const draggedItem = items[draggedSubjectIndex];
        items.splice(draggedSubjectIndex, 1);
        items.splice(index, 0, draggedItem);

        setLocalSubjects(items);
        setDraggedSubjectIndex(index);
    };

    const handleSubjectDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedSubjectIndex(null);
    };

    return (
        <div className={styles.card} style={{ borderLeftColor: mainSubject.color }}>
            <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.headerLeft}>
                    <button className={styles.expandButton}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div>
                        <h3 className={styles.title}>{mainSubject.title}</h3>
                        {mainSubject.description && (
                            <p className={styles.description}>{mainSubject.description}</p>
                        )}
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.progress}>
                        <span className={styles.progressText}>
                            {progress.completed} / {progress.total} topics
                        </span>
                        <ProgressBar percentage={progress.percentage} height="small" />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.content}>
                    <div className={styles.actions}>
                        {isEditMode && (
                            <Button
                                variant="outline"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddSubject();
                                }}
                                icon={<Plus size={16} />}
                            >
                                Add Subject
                            </Button>
                        )}
                        {isEditMode && (
                            <Button
                                variant="danger"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                icon={<Trash2 size={16} />}
                            >
                                Delete Main Subject
                            </Button>
                        )}
                    </div>

                    {mainSubject.subjects.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No subjects yet. Click "Add Subject" to get started.</p>
                        </div>
                    ) : (
                        <div className={styles.subjects}>
                            {localSubjects.map((subject, index) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    mainSubjectId={mainSubject.id}
                                    onAddTopic={() => onAddTopic(subject.id)}
                                    onDelete={() => onDeleteSubject(subject.id)}
                                    onToggleTopic={(topicId) => onToggleTopic(subject.id, topicId)}
                                    onDeleteTopic={(topicId) => onDeleteTopic(subject.id, topicId)}
                                    onRenameTopic={(topicId, newTitle) => {
                                        if (onUpdateTopic) {
                                            onUpdateTopic(subject.id, topicId, newTitle);
                                        }
                                    }}
                                    onReorderTopics={(reorderedTopics) => {
                                        if (onReorderTopics) {
                                            onReorderTopics(subject.id, reorderedTopics);
                                        }
                                    }}
                                    isEditMode={isEditMode}
                                    draggable={isEditMode}
                                    onDragStart={handleSubjectDragStart(index)}
                                    onDragEnd={handleSubjectDragEnd}
                                    onDragOver={handleSubjectDragOver(index)}
                                    onDrop={handleSubjectDrop}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
