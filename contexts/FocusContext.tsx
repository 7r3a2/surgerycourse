'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface FocusSession {
    id: string;
    duration: number;
    completedAt: number;
    subjectName?: string;
    topicName?: string;
}

interface FocusContextType {
    duration: number;
    remaining: number;
    isActive: boolean;
    isPaused: boolean;
    sessions: FocusSession[];
    subjectName: string;
    topicName: string;
    setDuration: (minutes: number) => void;
    setSubjectName: (name: string) => void;
    setTopicName: (name: string) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    resetTimer: () => void;
    getProgress: () => number;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within FocusProvider');
    }
    return context;
};

export const FocusProvider = ({ children }: { children: ReactNode }) => {
    const [duration, setDurationState] = useState(25);
    const [remaining, setRemaining] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [subjectName, setSubjectNameState] = useState('');
    const [topicName, setTopicNameState] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/focus/sessions');
                if (response.ok) {
                    const data = await response.json();
                    setSessions(data);
                }
            } catch (error) {
                console.error('Error loading focus sessions:', error);
            }
        };
        fetchSessions();
    }, []);

    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                setRemaining(prev => {
                    if (prev <= 1) {
                        completeSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isPaused]);

    const setDuration = (minutes: number) => {
        setDurationState(minutes);
        setRemaining(minutes * 60);
        setIsActive(false);
        setIsPaused(false);
    };

    const startTimer = () => {
        setIsActive(true);
        setIsPaused(false);
    };

    const pauseTimer = () => {
        setIsPaused(true);
    };

    const resumeTimer = () => {
        setIsPaused(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setRemaining(duration * 60);
    };

    const completeSession = () => {
        // Play completion sound
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzaJ0fPTgjMGHm7A7+OZRQ0PVKzn7rNgGAg+ltzy0H8pBSh+zPLaizsIGGS56+mlURAMU6rm8Ltl');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Audio play failed:', err));
        } catch (err) {
            console.log('Audio creation failed:', err);
        }

        // Save session but DON'T reset or deactivate - keep timer visible for music/finish button
        const newSession: FocusSession = {
            id: Date.now().toString(),
            duration,
            completedAt: Date.now(),
            subjectName: subjectName || undefined,
            topicName: topicName || undefined,
        };
        setSessions(prev => [newSession, ...prev].slice(0, 10));

        // Keep isActive true and remaining at 0 so timer stays visible
        // User will click "Finish Session" button to reset
    };

    const getProgress = () => {
        const totalSeconds = duration * 60;
        const elapsed = totalSeconds - remaining;
        return (elapsed / totalSeconds) * 100;
    };

    const setSubjectName = (name: string) => {
        setSubjectNameState(name);
    };

    const setTopicName = (name: string) => {
        setTopicNameState(name);
    };

    const value: FocusContextType = {
        duration,
        remaining,
        isActive,
        isPaused,
        sessions,
        subjectName,
        topicName,
        setDuration,
        setSubjectName,
        setTopicName,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        getProgress,
    };

    return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};
