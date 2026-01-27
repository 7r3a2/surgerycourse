import React from 'react';
import styles from './CircularProgress.module.css';

interface CircularProgressProps {
    percentage: number;
    color?: string;
    size?: number;
    strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    size = 150,
    strokeWidth = 10,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={styles.circularContainer} style={{ width: size, height: size }}>
            <svg className={styles.svg} width={size} height={size}>
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>
                <circle
                    className={styles.backgroundCircle}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className={styles.progressCircle}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className={styles.centerText}>
                <span className={styles.percentage}>{Math.round(percentage)}%</span>
                <span className={styles.label}>Progress</span>
            </div>
        </div>
    );
};
