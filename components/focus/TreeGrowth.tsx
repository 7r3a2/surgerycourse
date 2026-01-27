'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useFocus } from '@/contexts/FocusContext';
import styles from './TreeGrowth.module.css';

export const TreeGrowth: React.FC = () => {
    const { getProgress } = useFocus();
    const progress = getProgress();

    // Determine tree stage based on progress
    const getStage = () => {
        if (progress >= 100) return 4;
        if (progress >= 75) return 3;
        if (progress >= 50) return 2;
        if (progress >= 25) return 1;
        return 0;
    };

    const stage = getStage();

    return (
        <div className={styles.container}>
            <svg viewBox="0 0 200 300" className={styles.tree}>
                {/* Ground */}
                <ellipse cx="100" cy="280" rx="80" ry="15" fill="#8b7355" opacity="0.3" />

                {/* Trunk */}
                <motion.rect
                    x="90"
                    y="180"
                    width="20"
                    height="100"
                    rx="3"
                    fill="#6b5345"
                    initial={{ height: 20, y: 260 }}
                    animate={{ height: 100, y: 180 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />

                {/* Stage 1: Small sprout (25%) */}
                {stage >= 1 && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <circle cx="100" cy="170" r="15" fill="#86efac" opacity="0.8" />
                        <circle cx="85" cy="175" r="12" fill="#86efac" opacity="0.8" />
                        <circle cx="115" cy="175" r="12" fill="#86efac" opacity="0.8" />
                    </motion.g>
                )}

                {/* Stage 2: Growing branches (50%) */}
                {stage >= 2 && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <circle cx="100" cy="140" r="25" fill="#4ade80" />
                        <circle cx="75" cy="155" r="20" fill="#4ade80" />
                        <circle cx="125" cy="155" r="20" fill="#4ade80" />
                        <circle cx="85" cy="130" r="18" fill="#4ade80" opacity="0.9" />
                        <circle cx="115" cy="130" r="18" fill="#4ade80" opacity="0.9" />
                    </motion.g>
                )}

                {/* Stage 3: Full tree (75%) */}
                {stage >= 3 && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <circle cx="100" cy="100" r="35" fill="#22c55e" />
                        <circle cx="65" cy="125" r="28" fill="#22c55e" />
                        <circle cx="135" cy="125" r="28" fill="#22c55e" />
                        <circle cx="75" cy="95" r="25" fill="#22c55e" opacity="0.9" />
                        <circle cx="125" cy="95" r="25" fill="#22c55e" opacity="0.9" />
                        <circle cx="90" cy="75" r="20" fill="#22c55e" opacity="0.8" />
                        <circle cx="110" cy="75" r="20" fill="#22c55e" opacity="0.8" />
                    </motion.g>
                )}

                {/* Stage 4: Flourishing tree with flowers (100%) */}
                {stage >= 4 && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        {/* Flowers/Fruits */}
                        <circle cx="70" cy="110" r="5" fill="#fbbf24" />
                        <circle cx="130" cy="110" r="5" fill="#fbbf24" />
                        <circle cx="100" cy="65" r="5" fill="#fbbf24" />
                        <circle cx="85" cy="85" r="5" fill="#fbbf24" />
                        <circle cx="115" cy="85" r="5" fill="#fbbf24" />
                        <circle cx="95" cy="120" r="5" fill="#fbbf24" />
                        <circle cx="105" cy="120" r="5" fill="#fbbf24" />

                        {/* Extra foliage */}
                        <circle cx="100" cy="60" r="30" fill="#16a34a" opacity="0.9" />
                        <circle cx="60" cy="115" r="25" fill="#16a34a" opacity="0.8" />
                        <circle cx="140" cy="115" r="25" fill="#16a34a" opacity="0.8" />
                    </motion.g>
                )}

                {/* Sparkles for completion */}
                {stage >= 4 && (
                    <>
                        <motion.circle
                            cx="50"
                            cy="80"
                            r="3"
                            fill="#fbbf24"
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="150"
                            cy="90"
                            r="3"
                            fill="#fbbf24"
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                        <motion.circle
                            cx="100"
                            cy="40"
                            r="3"
                            fill="#fbbf24"
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                    </>
                )}
            </svg>

            <div className={styles.stageLabel}>
                {stage === 0 && 'Seed planted'}
                {stage === 1 && 'Sprouting...'}
                {stage === 2 && 'Growing...'}
                {stage === 3 && 'Flourishing...'}
                {stage === 4 && 'Fully grown! 🌳'}
            </div>
        </div>
    );
};
