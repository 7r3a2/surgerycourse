'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Palette, X } from 'lucide-react';
import styles from './DayColorModal.module.css';

interface DayColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    currentColor: string | null;
    onColorSelect: (color: string) => void;
    onColorRemove: () => void;
}

const PREDEFINED_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
];

export const DayColorModal: React.FC<DayColorModalProps> = ({
    isOpen,
    onClose,
    selectedDate,
    currentColor,
    onColorSelect,
    onColorRemove,
}) => {
    const [customColor, setCustomColor] = useState(currentColor || '#3b82f6');

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleColorClick = (color: string) => {
        onColorSelect(color);
        onClose();
    };

    const handleCustomColorApply = () => {
        onColorSelect(customColor);
        onClose();
    };

    const handleRemoveColor = () => {
        onColorRemove();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Choose Day Color">
            <div className={styles.content}>
                <div className={styles.dateDisplay}>
                    <Palette size={20} />
                    <span>{formatDate(selectedDate)}</span>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Predefined Colors</h3>
                    <div className={styles.colorGrid}>
                        {PREDEFINED_COLORS.map((color) => (
                            <button
                                key={color.value}
                                className={`${styles.colorOption} ${currentColor === color.value ? styles.selected : ''
                                    }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => handleColorClick(color.value)}
                                title={color.name}
                            >
                                {currentColor === color.value && (
                                    <span className={styles.checkmark}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Custom Color</h3>
                    <div className={styles.customColorSection}>
                        <input
                            type="color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className={styles.colorPicker}
                        />
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleCustomColorApply}
                        >
                            Apply Custom
                        </Button>
                    </div>
                </div>

                <div className={styles.actions}>
                    {currentColor && (
                        <Button
                            variant="outline"
                            onClick={handleRemoveColor}
                            icon={<X size={16} />}
                        >
                            Remove Color
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
