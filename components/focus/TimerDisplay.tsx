'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';
import { Button } from '../ui/Button';
import styles from './TimerDisplay.module.css';

export const TimerDisplay: React.FC = () => {
    const { remaining, isPaused, isActive, pauseTimer, resumeTimer, resetTimer, getProgress, subjectName, topicName } = useFocus();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Initialize audio element
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/completion-music.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (remaining === 0 && isActive && !isPlaying) {
            // Play music when timer completes
            if (audioRef.current) {
                audioRef.current.play().catch(err => console.log('Audio play failed:', err));
                setIsPlaying(true);
            }
        }
    }, [remaining, isActive, isPlaying]);

    const handleFinish = () => {
        // Stop music
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        resetTimer();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = getProgress();
    const circumference = 2 * Math.PI * 220;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    if (!isActive) return null;

    return (
        <div className={styles.container}>
            {(subjectName || topicName) && (
                <div className={styles.sessionInfo}>
                    {subjectName && <div className={styles.subject}>{subjectName}</div>}
                    {topicName && <div className={styles.topic}>{topicName}</div>}
                </div>
            )}

            <div className={styles.timerCircle}>
                <svg className={styles.progressRing} width="500" height="500">
                    <circle
                        className={styles.progressRingCircle}
                        stroke="var(--gray-200)"
                        strokeWidth="16"
                        fill="transparent"
                        r="220"
                        cx="250"
                        cy="250"
                    />
                    <circle
                        className={styles.progressRingProgress}
                        stroke="url(#gradient)"
                        strokeWidth="16"
                        fill="transparent"
                        r="220"
                        cx="250"
                        cy="250"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: strokeDashoffset,
                        }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--primary-teal)" />
                            <stop offset="100%" stopColor="var(--secondary-blue)" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className={styles.timerText}>
                    <div className={styles.time}>{formatTime(remaining)}</div>
                    <div className={styles.label}>
                        {remaining === 0 ? 'Complete! 🎉' : isPaused ? 'Paused' : 'Focus Time'}
                    </div>
                </div>
            </div>

            {remaining > 0 && (
                <div className={styles.controls}>
                    {isActive && !isPaused && (
                        <Button onClick={pauseTimer} variant="outline" size="large" icon={<Pause size={20} />}>
                            Pause
                        </Button>
                    )}

                    {isPaused && (
                        <Button onClick={resumeTimer} variant="primary" size="large" icon={<Play size={20} />}>
                            Resume
                        </Button>
                    )}

                    <Button onClick={resetTimer} variant="danger" size="large" icon={<Square size={20} />}>
                        Stop
                    </Button>
                </div>
            )}

            {remaining === 0 && (
                <div className={styles.completionMessage}>
                    <h3>🎉 Session Complete!</h3>
                    <p>Great job staying focused!</p>
                    {isPlaying && <p className={styles.musicNote}>🎵 Music playing...</p>}
                    <Button onClick={handleFinish} size="large" variant="primary">
                        Finish Session
                    </Button>
                </div>
            )}
        </div>
    );
};
