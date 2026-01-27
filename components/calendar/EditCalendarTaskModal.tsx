'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodo, CalendarTask } from '@/contexts/TodoContext';
import styles from './EditCalendarTaskModal.module.css';

interface EditCalendarTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: CalendarTask | null;
}

export const EditCalendarTaskModal: React.FC<EditCalendarTaskModalProps> = ({ isOpen, onClose, task }) => {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const { updateCalendarTask, deleteCalendarTask, toggleCalendarTask } = useTodo();

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setColor(task.color || '#3b82f6');
        }
    }, [task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task && title.trim()) {
            updateCalendarTask(task.id, title.trim(), color);
            handleClose();
        }
    };

    const handleDelete = () => {
        if (task) {
            deleteCalendarTask(task.id);
            handleClose();
        }
    };

    const handleToggle = () => {
        if (task) {
            toggleCalendarTask(task.id);
        }
    };

    const handleClose = () => {
        setTitle('');
        setColor('#3b82f6');
        onClose();
    };

    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Calendar Task">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="task-title" className={styles.label}>
                        Task Title *
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                        placeholder="Enter task title..."
                        required
                        autoFocus
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="task-color" className={styles.label}>
                        Color
                    </label>
                    <div className={styles.colorPicker}>
                        <input
                            id="task-color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className={styles.colorInput}
                        />
                        <span className={styles.colorLabel}>{color}</span>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Status
                    </label>
                    <button
                        type="button"
                        onClick={handleToggle}
                        className={`${styles.statusButton} ${task.completed ? styles.completed : ''}`}
                    >
                        {task.completed ? '✓ Completed' : '○ Not Completed'}
                    </button>
                </div>

                <div className={styles.buttons}>
                    <Button type="button" variant="outline" onClick={handleDelete}>
                        Delete Task
                    </Button>
                    <div className={styles.rightButtons}>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={!title.trim()}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
