'use client';

import React from 'react';
import { Trash2, Check, GripVertical, Pencil } from 'lucide-react';
import { Topic } from '@/contexts/TodoContext';
import styles from './TopicItem.module.css';

interface TopicItemProps {
    topic: Topic;
    onToggle: () => void;
    onDelete: () => void;
    onRename?: (newTitle: string) => void;
    isEditMode?: boolean;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({
    topic,
    onToggle,
    onDelete,
    onRename,
    isEditMode = false,
    draggable = false,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(topic.title);

    React.useEffect(() => {
        setEditTitle(topic.title);
    }, [topic.title]);

    const handleDelete = () => {
        if (confirm(`Delete topic "${topic.title}"?`)) {
            onDelete();
        }
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(true);
    };

    const handleRenameSubmit = () => {
        if (editTitle.trim() && editTitle !== topic.title && onRename) {
            onRename(editTitle.trim());
        }
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setEditTitle(topic.title);
            setIsRenaming(false);
        }
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

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (onDrop) onDrop(e);
    };

    return (
        <div
            className={`${styles.item} ${topic.completed ? styles.completed : ''} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
            draggable={draggable && isEditMode && !isRenaming}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isEditMode && draggable && !isRenaming && (
                <div className={styles.dragHandle}>
                    <GripVertical size={14} />
                </div>
            )}
            <label className={styles.checkboxContainer}>
                <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={onToggle}
                    className={styles.checkbox}
                    disabled={isRenaming}
                />
                <span className={styles.checkmark}>
                    {topic.completed && <Check size={14} />}
                </span>
            </label>

            {isRenaming ? (
                <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    className={styles.renameInput}
                    autoFocus
                />
            ) : (
                <span className={styles.title}>{topic.title}</span>
            )}

            {isEditMode && !isRenaming && onRename && (
                <button
                    className={styles.editButton}
                    onClick={handleRenameClick}
                    title="Rename topic"
                >
                    <Pencil size={14} />
                </button>
            )}

            <button
                className={styles.deleteButton}
                onClick={handleDelete}
                title="Delete topic"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};
