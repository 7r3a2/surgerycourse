import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    percentage: number;
    showLabel?: boolean;
    height?: 'small' | 'medium' | 'large';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    percentage,
    showLabel = true,
    height = 'medium',
}) => {
    const getColor = () => {
        if (percentage >= 75) return styles.high;
        if (percentage >= 50) return styles.medium;
        if (percentage >= 25) return styles.low;
        return styles.veryLow;
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.bar} ${styles[height]}`}>
                <div
                    className={`${styles.fill} ${getColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className={styles.labelContainer}>
                    <span className={styles.percentageText}>{percentage}%</span>
                </div>
            )}
        </div>
    );
};
