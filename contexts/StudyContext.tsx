'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTodo } from './TodoContext';
import { useAuth } from './AuthContext';

export interface ScheduledTopic {
    id: string; // Add DB ID
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectTitle: string;
    mainSubjectId: string;
    mainSubjectTitle: string;
    subjectColor: string;
    scheduledDate: number;
    completed: boolean;
}

export interface StudyPlan {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
    topicSchedule: ScheduledTopic[];
    createdAt: number;
}

interface SelectedTopicInput {
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectTitle: string;
    mainSubjectId: string;
    mainSubjectTitle: string;
    subjectColor: string;
}

interface StudyContextType {
    studyPlans: StudyPlan[];
    isLoading: boolean;
    addStudyPlan: (
        selectedTopics: SelectedTopicInput[],
        startDate: Date,
        endDate: Date
    ) => Promise<StudyPlan | undefined>;
    deleteStudyPlan: (id: string) => void;
    toggleScheduledTopic: (studyPlanId: string, topicId: string, mainSubjectId: string, subjectId: string) => void;
    getStudyPlanById: (id: string) => StudyPlan | undefined;
    getTopicsForDate: (studyPlanId: string, date: Date) => ScheduledTopic[];
    syncTopicCompletion: (mainSubjectId: string, subjectId: string, topicId: string, completed: boolean) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudy must be used within StudyProvider');
    }
    return context;
};

export const StudyProvider = ({ children }: { children: ReactNode }) => {
    const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { mainSubjects, toggleTopic } = useTodo();
    const { currentUser } = useAuth();

    // Load from DB when user changes
    useEffect(() => {
        const fetchPlans = async () => {
            if (!currentUser) {
                setStudyPlans([]);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/study/plans?userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const plans = data.map((plan: any) => ({
                        ...plan,
                        startDate: new Date(plan.startDate).getTime(),
                        endDate: new Date(plan.endDate).getTime(),
                        createdAt: new Date(plan.createdAt).getTime(),
                        topicSchedule: plan.scheduledTopics.map((st: any) => ({
                            ...st,
                            scheduledDate: new Date(st.scheduledDate).getTime()
                        }))
                    }));
                    setStudyPlans(plans);
                }
            } catch (error) {
                console.error('Error fetching study plans:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, [currentUser]);

    // Persistence is handled via API per-action

    // Sync study plans with TodoContext topics completion status
    useEffect(() => {
        if (isLoading || mainSubjects.length === 0) return;

        setStudyPlans(prevPlans => {
            let hasChanges = false;
            const updatedPlans = prevPlans.map(plan => {
                const updatedSchedule = plan.topicSchedule.map(scheduledTopic => {
                    // Find the topic in mainSubjects
                    const mainSubject = mainSubjects.find(ms => ms.id === scheduledTopic.mainSubjectId);
                    const subject = mainSubject?.subjects.find(s => s.id === scheduledTopic.subjectId);
                    const topic = subject?.topics.find(t => t.id === scheduledTopic.topicId);

                    if (topic && topic.completed !== scheduledTopic.completed) {
                        hasChanges = true;
                        return { ...scheduledTopic, completed: topic.completed };
                    }
                    return scheduledTopic;
                });

                return { ...plan, topicSchedule: updatedSchedule };
            });

            return hasChanges ? updatedPlans : prevPlans;
        });
    }, [mainSubjects, isLoading]);

    const distributeTopicsAcrossDates = (
        topics: SelectedTopicInput[],
        startDate: Date,
        endDate: Date
    ): ScheduledTopic[] => {
        const schedule: ScheduledTopic[] = [];

        if (topics.length === 0) return schedule;

        // Calculate number of days in range
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const numDays = Math.max(1, daysDiff);

        // Distribute topics evenly across days
        topics.forEach((topic, index) => {
            const dayIndex = Math.floor((index / topics.length) * numDays);
            const scheduledDate = new Date(start);
            scheduledDate.setDate(scheduledDate.getDate() + dayIndex);
            scheduledDate.setHours(12, 0, 0, 0); // Set to noon

            // Check if topic is already completed in TodoContext
            const mainSubject = mainSubjects.find(ms => ms.id === topic.mainSubjectId);
            const subject = mainSubject?.subjects.find(s => s.id === topic.subjectId);
            const existingTopic = subject?.topics.find(t => t.id === topic.topicId);
            const isCompleted = existingTopic?.completed || false;

            const generateUUID = () => {
                let d = new Date().getTime();
                let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = Math.random() * 16;
                    if (d > 0) {
                        r = (d + r) % 16 | 0;
                        d = Math.floor(d / 16);
                    } else {
                        r = (d2 + r) % 16 | 0;
                        d2 = Math.floor(d2 / 16);
                    }
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
            };

            schedule.push({
                topicId: topic.topicId,
                topicTitle: topic.topicTitle,
                subjectId: topic.subjectId,
                subjectTitle: topic.subjectTitle,
                mainSubjectId: topic.mainSubjectId,
                mainSubjectTitle: topic.mainSubjectTitle,
                subjectColor: topic.subjectColor,
                scheduledDate: scheduledDate.getTime(),
                completed: isCompleted,
                id: generateUUID(), // Custom UUID for mobile compatibility
            });
        });

        return schedule;
    };

    const addStudyPlan = async (
        selectedTopics: SelectedTopicInput[],
        startDate: Date,
        endDate: Date
    ): Promise<StudyPlan | undefined> => {
        if (selectedTopics.length === 0 || !currentUser) return;

        const topicSchedule = distributeTopicsAcrossDates(selectedTopics, startDate, endDate);

        // Generate a name based on subjects involved
        const subjectNames = [...new Set(selectedTopics.map(t => t.subjectTitle))];
        const planName = subjectNames.length > 2
            ? `${subjectNames.slice(0, 2).join(', ')} +${subjectNames.length - 2} more`
            : subjectNames.join(' & ');

        try {
            const response = await fetch('/api/study/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    name: `${planName} Study Plan`,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    topicSchedule
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newPlan: StudyPlan = {
                    ...data,
                    startDate: new Date(data.startDate).getTime(),
                    endDate: new Date(data.endDate).getTime(),
                    createdAt: new Date(data.createdAt).getTime(),
                    topicSchedule: data.scheduledTopics.map((st: any) => ({
                        ...st,
                        scheduledDate: new Date(st.scheduledDate).getTime()
                    }))
                };
                setStudyPlans(prev => [newPlan, ...prev]);
                return newPlan;
            }
        } catch (error) {
            console.error('Error adding study plan:', error);
            alert(`Failed to create study plan. Please try again.`);
        }
        return undefined;
    };

    const deleteStudyPlan = async (id: string) => {
        try {
            const response = await fetch(`/api/study/plans/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setStudyPlans(prev => prev.filter(plan => plan.id !== id));
            }
        } catch (error) {
            console.error('Error deleting study plan:', error);
        }
    };

    // ... (existing useEffects)

    const toggleScheduledTopic = async (studyPlanId: string, topicId: string, mainSubjectId: string, subjectId: string) => {
        // Trigger global topic toggle. 
        // valid logic: The useEffect above (lines 108-132) will detect the change in 'mainSubjects' 
        // and automatically update the local 'studyPlans' state to match.
        await toggleTopic(mainSubjectId, subjectId, topicId);
    };

    // Function to sync topic completion from external sources (like TodoContext)
    const syncTopicCompletion = useCallback((mainSubjectId: string, subjectId: string, topicId: string, completed: boolean) => {
        setStudyPlans(prev =>
            prev.map(plan => ({
                ...plan,
                topicSchedule: plan.topicSchedule.map(topic =>
                    topic.topicId === topicId &&
                        topic.mainSubjectId === mainSubjectId &&
                        topic.subjectId === subjectId
                        ? { ...topic, completed }
                        : topic
                ),
            }))
        );
    }, []);

    const getStudyPlanById = (id: string): StudyPlan | undefined => {
        return studyPlans.find(plan => plan.id === id);
    };

    const getTopicsForDate = (studyPlanId: string, date: Date): ScheduledTopic[] => {
        const plan = studyPlans.find(p => p.id === studyPlanId);
        if (!plan) return [];

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return plan.topicSchedule.filter(
            topic =>
                topic.scheduledDate >= startOfDay.getTime() &&
                topic.scheduledDate <= endOfDay.getTime()
        );
    };

    const value: StudyContextType = {
        studyPlans,
        isLoading,
        addStudyPlan,
        deleteStudyPlan,
        toggleScheduledTopic,
        getStudyPlanById,
        getTopicsForDate,
        syncTopicCompletion,
    };

    return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};
