'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodo } from '@/contexts/TodoContext';
import styles from './AddTopicModal.module.css';

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose, subjectId }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const { addTopic, mainSubjects } = useTodo();

    // Find the mainSubjectId for this subject
    const mainSubjectId = mainSubjects.find(ms =>
        ms.subjects.some(s => s.id === subjectId)
    )?.id || '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            const dueDateTimestamp = dueDate ? new Date(dueDate).setHours(23, 59, 59, 999) : undefined;
            addTopic(mainSubjectId, subjectId, title.trim(), dueDateTimestamp);
            setTitle('');
            setDueDate('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Topic">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="topic-title" className={styles.label}>
                        Topic Title *
                    </label>
                    <input
                        id="topic-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Heart Anatomy, ECG Reading"
                        className={styles.input}
                        autoFocus
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="topic-due-date" className={styles.label}>
                        Due Date (Optional)
                    </label>
                    <input
                        id="topic-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={styles.input}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {dueDate && (
                        <button
                            type="button"
                            onClick={() => setDueDate('')}
                            className={styles.clearDate}
                        >
                            Clear date
                        </button>
                    )}
                </div>

                <div className={styles.buttons}>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={!title.trim()}>
                        Add Topic
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
