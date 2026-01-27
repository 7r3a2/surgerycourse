'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './AnatomyFlashcards.module.css';

interface Flashcard {
    term: string;
    definition: string;
    category: string;
}

const FLASHCARDS: Flashcard[] = [
    {
        term: 'Myocardium',
        definition: 'The muscular middle layer of the heart wall responsible for contractions',
        category: 'Cardiology',
    },
    {
        term: 'Alveoli',
        definition: 'Tiny air sacs in the lungs where gas exchange occurs',
        category: 'Respiratory',
    },
    {
        term: 'Nephron',
        definition: 'The functional unit of the kidney that filters blood',
        category: 'Renal',
    },
    {
        term: 'Cerebellum',
        definition: 'Part of the brain responsible for coordination and balance',
        category: 'Neurology',
    },
    {
        term: 'Hematology',
        definition: 'The study of blood and blood disorders',
        category: 'Medicine',
    },
    {
        term: 'Pericardium',
        definition: 'The protective sac surrounding the heart',
        category: 'Cardiology',
    },
];

export const AnatomyFlashcards: React.FC = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setCurrentCard((prev) => (prev + 1) % FLASHCARDS.length);
        setIsFlipped(false);
    };

    const handlePrevious = () => {
        setCurrentCard((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const card = FLASHCARDS[currentCard];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Anatomy Flashcards</h3>
                <div className={styles.progress}>
                    {currentCard + 1} / {FLASHCARDS.length}
                </div>
            </div>

            <div className={styles.cardContainer} onClick={handleFlip}>
                <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
                    <div className={styles.cardFront}>
                        <div className={styles.category}>{card.category}</div>
                        <div className={styles.term}>{card.term}</div>
                        <div className={styles.hint}>Click to reveal definition</div>
                    </div>
                    <div className={styles.cardBack}>
                        <div className={styles.category}>{card.category}</div>
                        <div className={styles.definition}>{card.definition}</div>
                        <div className={styles.hint}>Click to see term</div>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <Button variant="outline" onClick={handlePrevious} icon={<ChevronLeft size={20} />}>
                    Previous
                </Button>
                <Button variant="outline" onClick={handleFlip} icon={<RotateCw size={20} />}>
                    Flip
                </Button>
                <Button variant="outline" onClick={handleNext} icon={<ChevronRight size={20} />}>
                    Next
                </Button>
            </div>
        </div>
    );
};
