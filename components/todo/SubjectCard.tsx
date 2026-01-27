'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { Subject } from '@/contexts/TodoContext';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { TopicItem } from './TopicItem';
import styles from './SubjectCard.module.css';

interface SubjectCardProps {
    subject: Subject;
    mainSubjectId: string;
    onAddTopic: () => void;
    onDelete: () => void;
    onToggleTopic: (topicId: string) => void;
    onDeleteTopic: (topicId: string) => void;
    onRenameTopic?: (topicId: string, newTitle: string) => void;
    onReorderTopics?: (reorderedTopics: any[]) => void;
    isEditMode: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    draggable?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
    subject,
    mainSubjectId,
    onAddTopic,
    onDelete,
    onToggleTopic,
    onDeleteTopic,
    onRenameTopic,
    onReorderTopics,
    isEditMode,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    draggable = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [localTopics, setLocalTopics] = useState(subject.topics);
    const draggedTopicIndexRef = React.useRef<number | null>(null);

    // Update local state when subject topics change
    React.useEffect(() => {
        setLocalTopics(subject.topics);
    }, [subject.topics]);

    const handleTopicDragStart = (index: number) => (e: React.DragEvent) => {
        draggedTopicIndexRef.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTopicDragEnd = () => {
        console.log('🎯 Topic drag ended', { draggedTopicIndex: draggedTopicIndexRef.current, localTopicsLength: localTopics.length, hasCallback: !!onReorderTopics });
        if (draggedTopicIndexRef.current !== null && localTopics.length > 0 && onReorderTopics) {
            console.log('💾 Calling onReorderTopics with:', localTopics);
            // Save to context/localStorage
            onReorderTopics(localTopics);
        }
        draggedTopicIndexRef.current = null;
    };

    const handleTopicDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedTopicIndexRef.current === null || draggedTopicIndexRef.current === index) return;

        const items = [...localTopics];
        const draggedItem = items[draggedTopicIndexRef.current];
        items.splice(draggedTopicIndexRef.current, 1);
        items.splice(index, 0, draggedItem);

        setLocalTopics(items);
        draggedTopicIndexRef.current = index;
    };

    const handleTopicDrop = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        if (onDragStart) onDragStart(e);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setIsDragging(false);
        if (onDragEnd) onDragEnd(e);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
        if (onDragOver) onDragOver(e);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (onDrop) onDrop(e);
    };

    const progress = {
        total: subject.topics.length,
        completed: subject.topics.filter((t) => t.completed).length,
    };
    const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

    return (
        <div
            className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
            style={{ borderLeftColor: subject.color }}
            draggable={draggable && isEditMode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.headerLeft}>
                    {isEditMode && draggable && (
                        <div className={styles.dragHandle}>
                            <GripVertical size={16} />
                        </div>
                    )}
                    <button className={styles.expandButton}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div>
                        <h4 className={styles.title}>{subject.title}</h4>
                        {subject.description && (
                            <p className={styles.description}>{subject.description}</p>
                        )}
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.progressText}>
                        {progress.completed} / {progress.total}
                    </span>
                </div>
            </div>

            {progress.total > 0 && (
                <div className={styles.progressWrapper}>
                    <ProgressBar percentage={percentage} height="small" />
                </div>
            )}

            {isExpanded && (
                <div className={styles.content}>
                    <div className={styles.actions}>
                        {isEditMode && (
                            <Button
                                variant="outline"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddTopic();
                                }}
                                icon={<Plus size={14} />}
                            >
                                Add Topic
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
                                icon={<Trash2 size={14} />}
                            >
                                Delete Subject
                            </Button>
                        )}
                    </div>

                    {subject.topics.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No topics yet. Click "Add Topic" to get started.</p>
                        </div>
                    ) : (
                        <div className={styles.topics}>
                            {localTopics.map((topic, index) => (
                                <TopicItem
                                    key={topic.id}
                                    topic={topic}
                                    onToggle={() => onToggleTopic(topic.id)}
                                    onDelete={() => onDeleteTopic(topic.id)}
                                    onRename={(newTitle) => {
                                        if (onRenameTopic) {
                                            onRenameTopic(topic.id, newTitle);
                                        }
                                    }}
                                    isEditMode={isEditMode}
                                    draggable={isEditMode}
                                    onDragStart={handleTopicDragStart(index)}
                                    onDragEnd={handleTopicDragEnd}
                                    onDragOver={handleTopicDragOver(index)}
                                    onDrop={handleTopicDrop}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
