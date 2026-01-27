'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useTodo, CalendarTask } from '@/contexts/TodoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Calendar } from '@/components/calendar/Calendar';
import { TaskList } from '@/components/calendar/TaskList';
import { AddTaskModal } from '@/components/calendar/AddTaskModal';
import { EditCalendarTaskModal } from '@/components/calendar/EditCalendarTaskModal';
import { DayColorModal } from '@/components/calendar/DayColorModal';
import styles from './page.module.css';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isDayColorModalOpen, setIsDayColorModalOpen] = useState(false);
    const [isEditCalendarTaskModalOpen, setIsEditCalendarTaskModalOpen] = useState(false);
    const [colorPickerDate, setColorPickerDate] = useState<Date | null>(null);
    const [editingCalendarTask, setEditingCalendarTask] = useState<CalendarTask | null>(null);
    const { getTasksByDateRange, dayColors, getDayColor, setDayColor, removeDayColor, calendarTasks } = useTodo();

    // Get tasks for the current month
    const tasksForMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return getTasksByDateRange(startDate, endDate);
    }, [currentDate, getTasksByDateRange]);

    // Create a map of date -> task count (including calendar tasks)
    const tasksPerDay = useMemo(() => {
        const map = new Map<string, number>();
        tasksForMonth.forEach((task) => {
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                map.set(key, (map.get(key) || 0) + 1);
            }
        });
        // Add calendar tasks
        calendarTasks.forEach((task) => {
            const date = new Date(task.dueDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const year = date.getFullYear();
            const month = date.getMonth();
            // Only include if in current month
            if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
                map.set(key, (map.get(key) || 0) + 1);
            }
        });
        return map;
    }, [tasksForMonth, calendarTasks, currentDate]);

    // Get tasks for selected date (including calendar tasks)
    const tasksForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get topic tasks
        const topicTasks = getTasksByDateRange(startOfDay, endOfDay);

        // Get calendar tasks for the selected date
        const filteredCalendarTasks = calendarTasks
            .filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= startOfDay && taskDate <= endOfDay;
            })
            .map(task => ({
                ...task,
                color: task.color || '#3b82f6',
                isCalendarTask: true
            }));

        // Merge and return all tasks
        return [...topicTasks, ...filteredCalendarTasks];
    }, [selectedDate, getTasksByDateRange, calendarTasks]);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleAddTask = () => {
        if (!selectedDate) {
            // If no date is selected, select today
            setSelectedDate(new Date());
        }
        setIsAddTaskModalOpen(true);
    };

    const handleDayColorClick = (date: Date) => {
        setColorPickerDate(date);
        setIsDayColorModalOpen(true);
    };

    const handleColorSelect = (color: string) => {
        if (colorPickerDate) {
            setDayColor(colorPickerDate, color);
        }
    };

    const handleColorRemove = () => {
        if (colorPickerDate) {
            removeDayColor(colorPickerDate);
        }
    };

    const handleEditCalendarTask = (task: any) => {
        setEditingCalendarTask(task as CalendarTask);
        setIsEditCalendarTaskModalOpen(true);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

    return (
        <div className={styles.container}>
            <BackButton />
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <CalendarIcon size={32} />
                        Calendar
                    </h1>
                    <p className={styles.subtitle}>Plan and track your study schedule</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleAddTask}
                    icon={<Plus size={20} />}
                >
                    Add Task
                </Button>
            </header>

            <div className={styles.content}>
                {/* Calendar Section */}
                <Card variant="bordered" className={styles.calendarCard}>
                    <div className={styles.calendarHeader}>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handlePreviousMonth}
                            icon={<ChevronLeft size={16} />}
                        >
                            Previous
                        </Button>

                        <div className={styles.selectors}>
                            <select
                                value={currentDate.getMonth()}
                                onChange={handleMonthChange}
                                className={styles.select}
                            >
                                {monthNames.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={currentDate.getFullYear()}
                                onChange={handleYearChange}
                                className={styles.select}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleNextMonth}
                            icon={<ChevronRight size={16} />}
                        >
                            Next
                        </Button>
                    </div>

                    <Calendar
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        tasksPerDay={tasksPerDay}
                        dayColors={dayColors}
                        onDayColorClick={handleDayColorClick}
                    />
                </Card>

                {/* Tasks Section */}
                <Card variant="bordered" className={styles.tasksCard}>
                    <TaskList
                        tasks={tasksForSelectedDate}
                        selectedDate={selectedDate}
                        onEditCalendarTask={handleEditCalendarTask}
                    />
                </Card>
            </div>

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                selectedDate={selectedDate}
            />

            {/* Edit Calendar Task Modal */}
            <EditCalendarTaskModal
                isOpen={isEditCalendarTaskModalOpen}
                onClose={() => setIsEditCalendarTaskModalOpen(false)}
                task={editingCalendarTask}
            />

            {/* Day Color Modal */}
            <DayColorModal
                isOpen={isDayColorModalOpen}
                onClose={() => setIsDayColorModalOpen(false)}
                selectedDate={colorPickerDate}
                currentColor={colorPickerDate ? getDayColor(colorPickerDate) : null}
                onColorSelect={handleColorSelect}
                onColorRemove={handleColorRemove}
            />
        </div >
    );
}
