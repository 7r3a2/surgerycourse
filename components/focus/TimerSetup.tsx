'use client';

import React, { useState } from 'react';
import { useFocus } from '@/contexts/FocusContext';
import { Button } from '../ui/Button';
import styles from './TimerSetup.module.css';

const PRESETS = [
    { minutes: 15, label: '15 min', emoji: '☕' },
    { minutes: 25, label: '25 min', emoji: '🍅' },
    { minutes: 45, label: '45 min', emoji: '📚' },
    { minutes: 60, label: '60 min', emoji: '🎯' },
];

export const TimerSetup: React.FC = () => {
    const { setDuration, setSubjectName, setTopicName, startTimer } = useFocus();
    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [customMinutes, setCustomMinutes] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');

    const handlePresetClick = (minutes: number) => {
        setSelectedMinutes(minutes);
        setCustomMinutes('');
    };

    const handleCustomChange = (value: string) => {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0 && num <= 180) {
            setCustomMinutes(value);
            setSelectedMinutes(num);
        } else if (value === '') {
            setCustomMinutes('');
        }
    };

    const handleStart = () => {
        setDuration(selectedMinutes);
        setSubjectName(subject);
        setTopicName(topic);
        startTimer();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Start Focus Session</h2>
                <p className={styles.subtitle}>Track your study time with a growing tree</p>
            </div>

            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Subject</label>
                    <input
                        type="text"
                        placeholder="e.g., Cardiology"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Topic</label>
                    <input
                        type="text"
                        placeholder="e.g., Heart Anatomy"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.presets}>
                <h3>Choose Duration</h3>
                <div className={styles.presetsGrid}>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.minutes}
                            onClick={() => handlePresetClick(preset.minutes)}
                            className={`${styles.preset} ${selectedMinutes === preset.minutes && !customMinutes ? styles.presetActive : ''}`}
                        >
                            <span className={styles.presetEmoji}>{preset.emoji}</span>
                            <span className={styles.presetLabel}>{preset.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.custom}>
                <label>Or custom duration (1-180 minutes)</label>
                <input
                    type="number"
                    min="1"
                    max="180"
                    placeholder="Enter minutes"
                    value={customMinutes}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className={styles.customInput}
                />
            </div>

            <div className={styles.selectedDuration}>
                <span>Selected:</span>
                <strong>{selectedMinutes} minutes</strong>
            </div>

            <Button size="large" onClick={handleStart}>
                Start Focus Session
            </Button>
        </div>
    );
};
