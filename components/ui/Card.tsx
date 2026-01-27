import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'bordered';
    hover?: boolean;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    hover = false,
    className = '',
    onClick,
}) => {
    return (
        <div
            className={`${styles.card} ${styles[variant]} ${hover ? styles.hover : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
