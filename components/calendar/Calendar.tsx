'use client';

import React from 'react';
import { Paintbrush } from 'lucide-react';
import styles from './Calendar.module.css';

interface CalendarProps {
    currentDate: Date;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    tasksPerDay: Map<string, number>;
    dayColors?: Map<string, string>;
    onDayColorClick?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
    currentDate,
    selectedDate,
    onDateSelect,
    tasksPerDay,
    dayColors,
    onDayColorClick,
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create array of day objects
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: new Date(year, month - 1, prevMonthLastDay - i),
            isCurrentMonth: false,
        });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        days.push({
            date: new Date(year, month, day),
            isCurrentMonth: true,
        });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
        days.push({
            date: new Date(year, month + 1, day),
            isCurrentMonth: false,
        });
    }

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const getDateKey = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleColorIconClick = (e: React.MouseEvent, date: Date) => {
        e.stopPropagation();
        if (onDayColorClick) {
            onDayColorClick(date);
        }
    };

    return (
        <div className={styles.calendar}>
            {/* Week day headers */}
            <div className={styles.weekDays}>
                {weekDays.map((day) => (
                    <div key={day} className={styles.weekDay}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className={styles.days}>
                {days.map((dayInfo, index) => {
                    const taskCount = tasksPerDay.get(getDateKey(dayInfo.date)) || 0;
                    const customColor = dayColors?.get(getDateKey(dayInfo.date));
                    const hasCustomColor = !!customColor;

                    return (
                        <button
                            key={index}
                            onClick={() => onDateSelect(dayInfo.date)}
                            className={`
                                ${styles.day}
                                ${!dayInfo.isCurrentMonth ? styles.otherMonth : ''}
                                ${isToday(dayInfo.date) ? styles.today : ''}
                                ${isSelected(dayInfo.date) ? styles.selected : ''}
                                ${taskCount > 0 ? styles.hasTasks : ''}
                                ${hasCustomColor ? styles.customColor : ''}
                            `}
                            style={hasCustomColor && !isToday(dayInfo.date) && !isSelected(dayInfo.date) ? {
                                background: `linear-gradient(135deg, ${customColor} 0%, ${customColor}dd 100%)`,
                                color: 'white',
                                borderColor: customColor,
                            } : {}}
                        >
                            <span className={styles.dayNumber}>{dayInfo.date.getDate()}</span>
                            {taskCount > 0 && (
                                <span className={styles.taskBadge}>{taskCount}</span>
                            )}
                            {onDayColorClick && dayInfo.isCurrentMonth && (
                                <button
                                    className={styles.colorIndicator}
                                    onClick={(e) => handleColorIconClick(e, dayInfo.date)}
                                    title="Set day color"
                                >
                                    <Paintbrush size={12} />
                                </button>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
