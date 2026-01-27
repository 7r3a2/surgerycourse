'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './TerminologyMatcher.module.css';

interface TermPair {
    term: string;
    definition: string;
}

const TERM_PAIRS: TermPair[] = [
    { term: 'Hypertension', definition: 'High blood pressure' },
    { term: 'Tachycardia', definition: 'Rapid heart rate' },
    { term: 'Bradycardia', definition: 'Slow heart rate' },
    { term: 'Hypoxia', definition: 'Low oxygen levels' },
    { term: 'Edema', definition: 'Swelling from fluid buildup' },
    { term: 'Arrhythmia', definition: 'Irregular heartbeat' },
];

export const TerminologyMatcher: React.FC = () => {
    const [terms, setTerms] = useState<string[]>([]);
    const [definitions, setDefinitions] = useState<string[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
    const [matches, setMatches] = useState<Set<number>>(new Set());
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    useEffect(() => {
        shuffleGame();
    }, []);

    const shuffleGame = () => {
        const shuffledTerms = [...TERM_PAIRS].sort(() => Math.random() - 0.5).map((p) => p.term);
        const shuffledDefs = [...TERM_PAIRS].sort(() => Math.random() - 0.5).map((p) => p.definition);
        setTerms(shuffledTerms);
        setDefinitions(shuffledDefs);
        setSelectedTerm(null);
        setSelectedDefinition(null);
        setMatches(new Set());
        setScore(0);
        setGameComplete(false);
    };

    const handleTermClick = (index: number) => {
        if (matches.has(index)) return;
        setSelectedTerm(index);
        if (selectedDefinition !== null) {
            checkMatch(index, selectedDefinition);
        }
    };

    const handleDefinitionClick = (index: number) => {
        if (matches.has(index + TERM_PAIRS.length)) return;
        setSelectedDefinition(index);
        if (selectedTerm !== null) {
            checkMatch(selectedTerm, index);
        }
    };

    const checkMatch = (termIndex: number, defIndex: number) => {
        const term = terms[termIndex];
        const definition = definitions[defIndex];

        const isMatch = TERM_PAIRS.some((pair) => pair.term === term && pair.definition === definition);

        if (isMatch) {
            const newMatches = new Set(matches);
            newMatches.add(termIndex);
            newMatches.add(defIndex + TERM_PAIRS.length);
            setMatches(newMatches);
            setScore(score + 1);

            if (newMatches.size === TERM_PAIRS.length * 2) {
                setGameComplete(true);
            }
        }

        setSelectedTerm(null);
        setSelectedDefinition(null);
    };

    if (gameComplete) {
        return (
            <Card className={styles.container}>
                <div className={styles.complete}>
                    <h3>Perfect Match! 🎉</h3>
                    <div className={styles.scoreDisplay}>
                        <CheckCircle size={80} className={styles.checkIcon} />
                        <p>You matched all {TERM_PAIRS.length} terms correctly!</p>
                    </div>
                    <Button onClick={shuffleGame} icon={<RotateCcw size={16} />}>
                        Play Again
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <h3>Match Medical Terms</h3>
                <div className={styles.score}>Matched: {score} / {TERM_PAIRS.length}</div>
            </div>

            <p className={styles.instructions}>Click a term and then its matching definition</p>

            <div className={styles.game}>
                <div className={styles.column}>
                    <h4>Terms</h4>
                    {terms.map((term, index) => (
                        <button
                            key={index}
                            onClick={() => handleTermClick(index)}
                            disabled={matches.has(index)}
                            className={`${styles.item} ${matches.has(index)
                                    ? styles.matched
                                    : selectedTerm === index
                                        ? styles.selected
                                        : ''
                                }`}
                        >
                            {term}
                            {matches.has(index) && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>

                <div className={styles.column}>
                    <h4>Definitions</h4>
                    {definitions.map((definition, index) => (
                        <button
                            key={index}
                            onClick={() => handleDefinitionClick(index)}
                            disabled={matches.has(index + TERM_PAIRS.length)}
                            className={`${styles.item} ${matches.has(index + TERM_PAIRS.length)
                                    ? styles.matched
                                    : selectedDefinition === index
                                        ? styles.selected
                                        : ''
                                }`}
                        >
                            {definition}
                            {matches.has(index + TERM_PAIRS.length) && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};
