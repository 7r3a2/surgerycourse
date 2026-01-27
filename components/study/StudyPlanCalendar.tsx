'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle2, Circle } from 'lucide-react';
import { StudyPlan, useStudy } from '@/contexts/StudyContext';
import { useTodo } from '@/contexts/TodoContext';
import { Button } from '../ui/Button';
import styles from './StudyPlanCalendar.module.css';

interface StudyPlanCalendarProps {
    plan: StudyPlan;
    onClose: () => void;
}

export const StudyPlanCalendar: React.FC<StudyPlanCalendarProps> = ({ plan: initialPlan, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date(initialPlan.startDate));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { toggleScheduledTopic, getTopicsForDate, getStudyPlanById } = useStudy();
    const { toggleTopic } = useTodo();

    // Get live plan data from context to ensure progress bar updates
    const plan = getStudyPlanById(initialPlan.id) || initialPlan;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get primary color from first topic
    const primaryColor = plan.topicSchedule[0]?.subjectColor || '#0d9488';

    // Get main subject title from first topic (all topics in a plan share the same main subject)
    const mainSubjectTitle = plan.topicSchedule[0]?.mainSubjectTitle || 'Study Plan';

    // Get unique subject titles for subtitle
    const subjectTitles = [...new Set(plan.topicSchedule.map(t => t.subjectTitle))];

    // Create array of day objects (matching calendar style)
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = useMemo(() => {
        const result: Array<{ date: Date; isCurrentMonth: boolean }> = [];

        // Add previous month's days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            result.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false,
            });
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            result.push({
                date: new Date(year, month, day),
                isCurrentMonth: true,
            });
        }

        // Add next month's days to fill the grid
        const remainingDays = 42 - result.length;
        for (let day = 1; day <= remainingDays; day++) {
            result.push({
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
            });
        }

        return result;
    }, [year, month, daysInMonth, startingDayOfWeek]);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

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

    const isDateInRange = (date: Date) => {
        const start = new Date(plan.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(plan.endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    };

    const getTopicsForDay = (date: Date) => {
        return getTopicsForDate(plan.id, date);
    };

    const handleToggleTopic = (topicId: string, mainSubjectId: string, subjectId: string) => {
        // Toggle in study plan
        toggleScheduledTopic(plan.id, topicId, mainSubjectId, subjectId);
        // Also toggle in To-Do list for bidirectional sync
        toggleTopic(mainSubjectId, subjectId, topicId);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Calculate overall progress from LIVE plan data
    const completedTopics = plan.topicSchedule.filter(t => t.completed).length;
    const totalTopics = plan.topicSchedule.length;
    const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Get topics for selected date sidebar
    const selectedDateTopics = selectedDate ? getTopicsForDay(selectedDate) : [];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header} style={{ background: primaryColor }}>
                    <div className={styles.headerContent}>
                        <div>
                            <h2 className={styles.title}>{mainSubjectTitle}</h2>
                            <p className={styles.subtitle}>
                                {subjectTitles.length > 3
                                    ? `${subjectTitles.slice(0, 3).join(', ')} +${subjectTitles.length - 3} more`
                                    : subjectTitles.join(', ')
                                }
                            </p>
                        </div>
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.progressInfo}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>
                            {completedTopics}/{totalTopics} topics ({progressPercentage}%)
                        </span>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    {/* Calendar Section */}
                    <div className={styles.calendarSection}>
                        <div className={styles.calendarNav}>
                            <Button variant="outline" size="small" onClick={handlePreviousMonth}>
                                <ChevronLeft size={18} />
                            </Button>
                            <h3 className={styles.monthYear}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <Button variant="outline" size="small" onClick={handleNextMonth}>
                                <ChevronRight size={18} />
                            </Button>
                        </div>

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
                                    const inRange = isDateInRange(dayInfo.date);
                                    const topics = inRange ? getTopicsForDay(dayInfo.date) : [];
                                    const taskCount = topics.length;
                                    const completedCount = topics.filter(t => t.completed).length;
                                    const allCompleted = taskCount > 0 && completedCount === taskCount;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => inRange && setSelectedDate(dayInfo.date)}
                                            className={`
                                                ${styles.day}
                                                ${!dayInfo.isCurrentMonth ? styles.otherMonth : ''}
                                                ${isToday(dayInfo.date) ? styles.today : ''}
                                                ${isSelected(dayInfo.date) ? styles.selected : ''}
                                                ${inRange ? styles.inRange : ''}
                                                ${allCompleted ? styles.allCompleted : ''}
                                            `}
                                            style={inRange && !isToday(dayInfo.date) && !isSelected(dayInfo.date) ? {
                                                borderColor: `${primaryColor}50`,
                                            } : {}}
                                        >
                                            <div className={styles.dayHeader}>
                                                <span className={styles.dayNumber}>{dayInfo.date.getDate()}</span>
                                                {taskCount > 0 && (
                                                    <span className={styles.completionStatus} style={{ color: allCompleted ? '#10b981' : 'inherit' }}>
                                                        {completedCount}/{taskCount}
                                                    </span>
                                                )}
                                            </div>

                                            {taskCount > 0 && (
                                                <div className={styles.subjectDots}>
                                                    {topics.slice(0, 6).map((topic, i) => (
                                                        <div
                                                            key={i}
                                                            className={styles.subjectDot}
                                                            style={{
                                                                backgroundColor: topic.subjectColor,
                                                                opacity: topic.completed ? 0.5 : 1
                                                            }}
                                                            title={`${topic.subjectTitle}: ${topic.topicTitle}`}
                                                        />
                                                    ))}
                                                    {topics.length > 6 && (
                                                        <span className={styles.moreDots}>+</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Topics Sidebar */}
                    <div className={`${styles.sidebar} ${selectedDate ? styles.sidebarVisible : ''}`}>
                        <div className={styles.sidebarHeader}>
                            <h4 className={styles.sidebarTitle}>
                                {selectedDate
                                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                    : 'Select a date'
                                }
                            </h4>
                            <button
                                className={styles.mobileCloseButton}
                                onClick={() => setSelectedDate(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {selectedDate && selectedDateTopics.length > 0 ? (
                            <div className={styles.topicsList}>
                                {selectedDateTopics.map(topic => (
                                    <button
                                        key={topic.topicId}
                                        className={`${styles.topicItem} ${topic.completed ? styles.completedTopic : ''}`}
                                        onClick={() => handleToggleTopic(topic.topicId, topic.mainSubjectId, topic.subjectId)}
                                        style={{ borderLeftColor: topic.subjectColor }}
                                    >
                                        {topic.completed ? (
                                            <CheckCircle2 size={20} className={styles.checkIcon} />
                                        ) : (
                                            <Circle size={20} className={styles.circleIcon} />
                                        )}
                                        <div className={styles.topicInfo}>
                                            <span className={styles.topicTitle}>{topic.topicTitle}</span>
                                            <span className={styles.topicSubject}>{topic.subjectTitle}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : selectedDate ? (
                            <div className={styles.emptyTopics}>
                                <p>No topics scheduled for this day</p>
                            </div>
                        ) : (
                            <div className={styles.emptyTopics}>
                                <p>Click on a day to see scheduled topics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
