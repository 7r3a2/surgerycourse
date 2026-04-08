'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodo, Topic } from '@/contexts/TodoContext';
import styles from './AddTaskModal.module.css';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, selectedDate }) => {
    const [mode, setMode] = useState<'link' | 'create'>('link');
    const [selectedMainSubjectId, setSelectedMainSubjectId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
    const [calendarTaskTitle, setCalendarTaskTitle] = useState('');
    const [calendarTaskColor, setCalendarTaskColor] = useState('#3b82f6');
    const { mainSubjects, updateTopicDueDate, addCalendarTask, calendarTasks } = useTodo();

    // Get subjects for selected main subject
    const availableSubjects = useMemo(() => {
        if (!selectedMainSubjectId) return [];
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        return mainSubject?.subjects || [];
    }, [selectedMainSubjectId, mainSubjects]);

    // Get topics for selected subject
    const availableTopics = useMemo(() => {
        if (!selectedSubjectId) return [];
        const mainSubject = mainSubjects.find(ms => ms.id === selectedMainSubjectId);
        const subject = mainSubject?.subjects.find(s => s.id === selectedSubjectId);
        return subject?.topics || [];
    }, [selectedMainSubjectId, selectedSubjectId, mainSubjects]);

    const handleMainSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMainSubjectId(e.target.value);
        setSelectedSubjectId(''); // Reset subject when main subject changes
        setSelectedTopicIds([]); // Reset topics
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubjectId(e.target.value);
        setSelectedTopicIds([]); // Reset topics when subject changes
    };

    const handleTopicToggle = (topicId: string) => {
        setSelectedTopicIds(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(id => id !== topicId);
            } else {
                return [...prev, topicId];
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'link') {
            if (selectedTopicIds.length > 0 && selectedDate) {
                const dueDateTimestamp = new Date(selectedDate).setHours(23, 59, 59, 999);

                // Update due date for all selected topics
                selectedTopicIds.forEach(topicId => {
                    updateTopicDueDate(selectedMainSubjectId, selectedSubjectId, topicId, dueDateTimestamp);
                });

                handleClose();
            }
        } else {
            if (calendarTaskTitle.trim() && selectedDate) {
                const dueDateTimestamp = new Date(selectedDate).setHours(23, 59, 59, 999);
                addCalendarTask(calendarTaskTitle.trim(), dueDateTimestamp, calendarTaskColor);
                handleClose();
            }
        }
    };

    const handleRemoveDueDate = () => {
        if (selectedTopicIds.length > 0) {
            // Remove due date (set to undefined) for all selected topics
            selectedTopicIds.forEach(topicId => {
                updateTopicDueDate(selectedMainSubjectId, selectedSubjectId, topicId, undefined);
            });

            handleClose();
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleClose = () => {
        setMode('link');
        setSelectedMainSubjectId('');
        setSelectedSubjectId('');
        setSelectedTopicIds([]);
        setCalendarTaskTitle('');
        setCalendarTaskColor('#3b82f6');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Task to Calendar">
            <form onSubmit={handleSubmit} className={styles.form}>
                {selectedDate && (
                    <div className={styles.dateInfo}>
                        📅 <strong>{formatDate(selectedDate)}</strong>
                    </div>
                )}

                {/* Mode Tabs */}
                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${mode === 'link' ? styles.activeTab : ''}`}
                        onClick={() => setMode('link')}
                    >
                        Link to To-Do List
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${mode === 'create' ? styles.activeTab : ''}`}
                        onClick={() => setMode('create')}
                    >
                        Create Calendar Task
                    </button>
                </div>

                {/* Link to To-Do List Mode */}
                {mode === 'link' && (
                    <>
                        <div className={styles.field}>
                            <label htmlFor="main-subject" className={styles.label}>
                                Main Subject *
                            </label>
                            <select
                                id="main-subject"
                                value={selectedMainSubjectId}
                                onChange={handleMainSubjectChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a main subject...</option>
                                {mainSubjects.map((mainSubject) => (
                                    <option key={mainSubject.id} value={mainSubject.id}>
                                        {mainSubject.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMainSubjectId && availableSubjects.length > 0 && (
                            <div className={styles.field}>
                                <label htmlFor="subject" className={styles.label}>
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    value={selectedSubjectId}
                                    onChange={handleSubjectChange}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Select a subject...</option>
                                    {availableSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedSubjectId && availableTopics.length > 0 && (
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Select Topics * ({selectedTopicIds.length} selected)
                                </label>
                                <div className={styles.topicsList}>
                                    {availableTopics.map((topic) => (
                                        <label key={topic.id} className={styles.topicItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedTopicIds.includes(topic.id)}
                                                onChange={() => handleTopicToggle(topic.id)}
                                                className={styles.checkbox}
                                            />
                                            <span className={topic.completed ? styles.completedTopic : ''}>
                                                {topic.title}
                                            </span>
                                            {topic.completed && (
                                                <span className={styles.completedBadge}>✓ Completed</span>
                                            )}
                                            {(() => {
                                                // Show date from topic.dueDate OR from calendar_tasks
                                                const calTask = calendarTasks.find(ct => ct.topicId === topic.id);
                                                const dateToShow = topic.dueDate
                                                    ? new Date(topic.dueDate)
                                                    : calTask ? new Date(calTask.dueDate) : null;
                                                return dateToShow ? (
                                                    <span className={styles.dueDateBadge}>
                                                        📅 {dateToShow.toLocaleDateString()}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSubjectId && availableTopics.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>No topics available in this subject. Please create topics in the To-Do List first.</p>
                            </div>
                        )}

                        {mainSubjects.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>No subjects available. Please create subjects in the To-Do List first.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Create Calendar Task Mode */}
                {mode === 'create' && (
                    <>
                        <div className={styles.field}>
                            <label htmlFor="task-title" className={styles.label}>
                                Task Title *
                            </label>
                            <input
                                id="task-title"
                                type="text"
                                value={calendarTaskTitle}
                                onChange={(e) => setCalendarTaskTitle(e.target.value)}
                                className={styles.input}
                                placeholder="Enter task title..."
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="task-color" className={styles.label}>
                                Color (Optional)
                            </label>
                            <div className={styles.colorPicker}>
                                <input
                                    id="task-color"
                                    type="color"
                                    value={calendarTaskColor}
                                    onChange={(e) => setCalendarTaskColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                                <span className={styles.colorLabel}>{calendarTaskColor}</span>
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.buttons}>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {mode === 'link' && selectedTopicIds.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveDueDate}
                        >
                            Remove from Calendar ({selectedTopicIds.length})
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            mode === 'link'
                                ? selectedTopicIds.length === 0 || mainSubjects.length === 0
                                : !calendarTaskTitle.trim()
                        }
                    >
                        {mode === 'link'
                            ? `Assign to Calendar (${selectedTopicIds.length})`
                            : 'Add Task'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
