'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodo } from '@/contexts/TodoContext';
import styles from './AddSubjectModal.module.css';

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_COLORS = [
    '#0d9488', // Teal
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Orange
    '#10b981', // Green
    '#ef4444', // Red
    '#6366f1', // Indigo
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const { addMainSubject } = useTodo();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            addMainSubject(title.trim(), description.trim(), color);
            setTitle('');
            setDescription('');
            setColor(PRESET_COLORS[0]);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Subject">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="title" className={styles.label}>
                        Subject Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Cardiology, Pharmacology"
                        className={styles.input}
                        autoFocus
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="description" className={styles.label}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description (optional)"
                        className={styles.textarea}
                        rows={3}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Color Theme</label>
                    <div className={styles.colorPicker}>
                        {PRESET_COLORS.map((presetColor) => (
                            <button
                                key={presetColor}
                                type="button"
                                className={`${styles.colorOption} ${color === presetColor ? styles.selected : ''}`}
                                style={{ backgroundColor: presetColor }}
                                onClick={() => setColor(presetColor)}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.buttons}>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={!title.trim()}>
                        Add Subject
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
