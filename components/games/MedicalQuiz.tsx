'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './MedicalQuiz.module.css';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
    {
        question: 'What is the normal resting heart rate for adults?',
        options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'],
        correctAnswer: 1,
        explanation: 'The normal resting heart rate for adults is 60-100 beats per minute.',
    },
    {
        question: 'Which chamber of the heart pumps blood to the body?',
        options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'],
        correctAnswer: 3,
        explanation: 'The left ventricle is the strongest chamber and pumps oxygenated blood to the body.',
    },
    {
        question: 'What does ECG stand for?',
        options: ['Electrocardiogram', 'Electro Cell Graph', 'Echo Cardio Graphic', 'Electronic Cardiac Graph'],
        correctAnswer: 0,
        explanation: 'ECG stands for Electrocardiogram, which records the electrical activity of the heart.',
    },
    {
        question: 'What is the largest artery in the human body?',
        options: ['Pulmonary Artery', 'Carotid Artery', 'Aorta', 'Femoral Artery'],
        correctAnswer: 2,
        explanation: 'The aorta is the largest artery, carrying oxygenated blood from the heart to the rest of the body.',
    },
    {
        question: 'How many chambers does the human heart have?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        explanation: 'The heart has 4 chambers: 2 atria (upper) and 2 ventricles (lower).',
    },
];

export const MedicalQuiz: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);

    const handleAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowResult(true);

        if (answerIndex === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizComplete(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setQuizComplete(false);
    };

    if (quizComplete) {
        const percentage = (score / QUIZ_QUESTIONS.length) * 100;
        return (
            <Card className={styles.quizCard}>
                <div className={styles.complete}>
                    <h3>Quiz Complete! 🎉</h3>
                    <div className={styles.scoreDisplay}>
                        <div className={styles.scoreBig}>{score}</div>
                        <div className={styles.scoreTotal}>out of {QUIZ_QUESTIONS.length}</div>
                    </div>
                    <div className={styles.percentage}>{percentage}%</div>
                    <p className={styles.feedback}>
                        {percentage >= 80 ? 'Excellent work! 🌟' : percentage >= 60 ? 'Good job! Keep learning! 📚' : 'Keep studying! You got this! 💪'}
                    </p>
                    <Button onClick={handleRestart} icon={<RotateCcw size={16} />}>
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    const question = QUIZ_QUESTIONS[currentQuestion];

    return (
        <Card className={styles.quizCard}>
            <div className={styles.header}>
                <div className={styles.progress}>
                    Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                </div>
                <div className={styles.score}>Score: {score}</div>
            </div>

            <h3 className={styles.question}>{question.question}</h3>

            <div className={styles.options}>
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && handleAnswer(index)}
                        disabled={showResult}
                        className={`${styles.option} ${showResult
                                ? index === question.correctAnswer
                                    ? styles.correct
                                    : index === selectedAnswer
                                        ? styles.incorrect
                                        : ''
                                : selectedAnswer === index
                                    ? styles.selected
                                    : ''
                            }`}
                    >
                        {option}
                        {showResult && index === question.correctAnswer && (
                            <CheckCircle className={styles.icon} size={20} />
                        )}
                        {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                            <XCircle className={styles.icon} size={20} />
                        )}
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={styles.explanation}>
                    <strong>Explanation:</strong> {question.explanation}
                </div>
            )}

            {showResult && (
                <div className={styles.actions}>
                    <Button onClick={handleNext}>
                        {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </div>
            )}
        </Card>
    );
};
