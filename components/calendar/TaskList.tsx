'use client';

import React from 'react';
import { CheckSquare, Trash2 } from 'lucide-react';
import { useTodo } from '@/contexts/TodoContext';
import styles from './TaskList.module.css';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: number;
    // For topic tasks
    mainSubjectId?: string;
    subjectId?: string;
    subjectTitle?: string;
    mainSubjectTitle?: string;
    color: string;
    // For calendar tasks
    isCalendarTask?: boolean;
    // CalendarTask ID when a linked To-Do topic is stored as a CalendarTask record
    calendarTaskId?: string;
}

interface TaskListProps {
    tasks: Task[];
    selectedDate: Date | null;
    onEditCalendarTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, selectedDate, onEditCalendarTask }) => {
    const { toggleTopic, updateTopicDueDate, toggleCalendarTask, deleteCalendarTask } = useTodo();

    if (!selectedDate) {
        return (
            <div className={styles.emptyState}>
                <CheckSquare size={48} color="var(--gray-300)" />
                <p>Select a date to view tasks</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className={styles.emptyState}>
                <CheckSquare size={48} color="var(--gray-300)" />
                <p>No tasks scheduled for this day</p>
            </div>
        );
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleToggle = (task: Task) => {
        if (task.isCalendarTask) {
            toggleCalendarTask(task.id);
        } else if (task.mainSubjectId && task.subjectId) {
            toggleTopic(task.mainSubjectId, task.subjectId, task.id);
        }
    };

    const handleRemove = (task: Task) => {
        if (task.calendarTaskId) {
            // Linked To-Do topic stored as a CalendarTask record — delete the CalendarTask
            deleteCalendarTask(task.calendarTaskId);
        } else if (task.isCalendarTask) {
            deleteCalendarTask(task.id);
        } else if (task.mainSubjectId && task.subjectId) {
            // Remove due date by setting it to undefined
            updateTopicDueDate(task.mainSubjectId, task.subjectId, task.id, undefined);
        }
    };

    const handleTaskClick = (task: Task) => {
        if (task.isCalendarTask) {
            onEditCalendarTask(task);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.dateTitle}>{formatDate(selectedDate)}</h3>
            <div className={styles.tasksList}>
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`${styles.taskItem} ${task.isCalendarTask ? styles.calendarTask : ''}`}
                    >
                        <button
                            onClick={() => handleToggle(task)}
                            className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
                            style={{
                                borderColor: task.color,
                                background: task.completed ? task.color : 'white',
                            }}
                        >
                            {task.completed && <CheckSquare size={16} color="white" />}
                        </button>
                        <div
                            className={styles.taskContent}
                            onClick={() => handleTaskClick(task)}
                            style={{ cursor: task.isCalendarTask ? 'pointer' : 'default' }}
                        >
                            <div className={styles.taskTitle}>
                                <span className={task.completed ? styles.completed : ''}>
                                    {task.title}
                                </span>
                                {task.isCalendarTask && (
                                    <span className={styles.calendarBadge}>📅 Calendar Task</span>
                                )}
                            </div>
                            {!task.isCalendarTask && task.subjectTitle && (
                                <div className={styles.taskMeta}>
                                    <span
                                        className={styles.subjectBadge}
                                        style={{ background: task.color }}
                                    >
                                        {task.subjectTitle}
                                    </span>
                                    <span className={styles.mainSubject}>
                                        {task.mainSubjectTitle}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleRemove(task)}
                            className={styles.removeButton}
                            title={task.isCalendarTask ? "Delete task" : "Remove from calendar"}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
