'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTodo } from '@/contexts/TodoContext';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GraduationCap, Calendar, Trash2, BarChart3 } from 'lucide-react';
import styles from './page.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExamEntry {
    id: string;
    title: string;
    examDate: string;
    color: string;
    sourceSubjectId: string | null;
    sourceMainSubjectId: string | null;
}

// day‑key → array of checked topic IDs
type DaySelections = Record<string, string[]>;

// ── Constants ──────────────────────────────────────────────────────────────────

const SCHEDULE_START = new Date(2026, 4, 14); // 14 May 2026
const SCHEDULE_END   = new Date(2026, 5, 30); // 30 Jun 2026

// ── Helpers ────────────────────────────────────────────────────────────────────

const storageKey = (uid: string) => `final-exams-sel-${uid}`;
const loadSel = (uid: string): DaySelections => {
    try { return JSON.parse(localStorage.getItem(storageKey(uid)) || '{}'); }
    catch { return {}; }
};
const saveSel = (uid: string, s: DaySelections) =>
    localStorage.setItem(storageKey(uid), JSON.stringify(s));

function toKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDates(): Date[] {
    const out: Date[] = [];
    const c = new Date(SCHEDULE_START);
    while (c <= SCHEDULE_END) { out.push(new Date(c)); c.setDate(c.getDate() + 1); }
    return out;
}

function fmtDay(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'long' }); }
function fmtDate(d: Date) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FinalExamsPage() {
    const router = useRouter();
    const { currentUser, isAdmin, isLoading: authLoading } = useAuth();
    const { mainSubjects } = useTodo();
    const [exams, setExams] = useState<ExamEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState<DaySelections>({});

    // Admin-only guard
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [authLoading, isAdmin, router]);

    if (!isAdmin) return null;

    // admin assign
    const [assignDate, setAssignDate] = useState<Date | null>(null);
    const [pickMsId, setPickMsId] = useState('');

    // open topic dropdown for a date‑key
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const allDates = buildDates();

    // ── fetch exams ──────────────────────────────────────────────────────────

    const fetchExams = useCallback(async () => {
        try {
            const r = await fetch('/api/final-exams/subjects');
            if (r.ok) setExams(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchExams(); }, [fetchExams]);
    useEffect(() => { if (currentUser) setSel(loadSel(currentUser.id)); }, [currentUser]);

    const persist = useCallback((next: DaySelections) => {
        if (!currentUser) return;
        setSel(next);
        saveSel(currentUser.id, next);
    }, [currentUser]);

    // click outside closes dropdown
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpenDropdown(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── helpers ──────────────────────────────────────────────────────────────

    const examByDate = (d: Date): ExamEntry | undefined => {
        const k = toKey(d);
        return exams.find(e => toKey(new Date(e.examDate)) === k);
    };

    // find the next exam ON or AFTER a given date
    const nextExamAfter = (d: Date): ExamEntry | undefined => {
        const t = d.getTime();
        return exams
            .filter(e => new Date(e.examDate).getTime() >= t)
            .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];
    };

    // all topics under a main subject (flattened across sub‑subjects)
    const topicsForMain = (msId: string | null) => {
        if (!msId) return [];
        const ms = mainSubjects.find(m => m.id === msId);
        if (!ms) return [];
        return ms.subjects.flatMap(s =>
            s.topics.map(t => ({ ...t, subjectTitle: s.title, subjectColor: s.color }))
        );
    };

    // ── admin actions ────────────────────────────────────────────────────────

    const openAssign = (d: Date) => {
        if (!isAdmin) return;
        setAssignDate(d);
        const ex = examByDate(d);
        setPickMsId(ex?.sourceMainSubjectId || '');
    };

    const doAssign = async () => {
        if (!assignDate || !pickMsId) return;
        const ms = mainSubjects.find(m => m.id === pickMsId);
        if (!ms) return;
        const existing = examByDate(assignDate);
        const payload = {
            title: ms.title,
            examDate: assignDate.toISOString(),
            color: ms.color,
            sourceSubjectId: null,
            sourceMainSubjectId: ms.id,
        };
        try {
            if (existing) {
                await fetch(`/api/final-exams/subjects/${existing.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch('/api/final-exams/subjects', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }
            await fetchExams();
        } catch (e) { console.error(e); }
        setAssignDate(null);
        setPickMsId('');
    };

    const removeExam = async (id: string) => {
        if (!confirm('Remove this exam?')) return;
        try {
            await fetch(`/api/final-exams/subjects/${id}`, { method: 'DELETE' });
            setExams(prev => prev.filter(e => e.id !== id));
        } catch (e) { console.error(e); }
    };

    // ── user topic toggle ────────────────────────────────────────────────────

    const toggleTopic = (dayKey: string, topicId: string) => {
        const cur = sel[dayKey] || [];
        const next = cur.includes(topicId)
            ? cur.filter(id => id !== topicId)
            : [...cur, topicId];
        persist({ ...sel, [dayKey]: next });
    };

    // ── progress stats ───────────────────────────────────────────────────────

    const getProgress = () => {
        // group free days by their next exam
        const examGroups: Record<string, { exam: ExamEntry; totalTopics: number; checkedCount: number }> = {};
        for (const d of allDates) {
            const ex = examByDate(d);
            if (ex) continue; // skip exam days themselves
            const ne = nextExamAfter(d);
            if (!ne) continue;
            if (!examGroups[ne.id]) {
                const topics = topicsForMain(ne.sourceMainSubjectId);
                examGroups[ne.id] = { exam: ne, totalTopics: topics.length, checkedCount: 0 };
            }
            const dayChecked = (sel[toKey(d)] || []).length;
            examGroups[ne.id].checkedCount += dayChecked;
        }
        return Object.values(examGroups);
    };

    const progress = getProgress();

    // ── render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className={styles.container}>
                <BackButton />
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <BackButton />

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerIcon}>
                            <GraduationCap size={24} color="white" />
                        </div>
                        <div>
                            <h1 className={styles.headerTitle}>Final Exams</h1>
                            <p className={styles.headerSubtitle}>
                                Plan your study before each final exam and track your progress day by day.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Table */}
            <div className={styles.tableSection}>
                <div className={styles.tableSectionHeader}>
                    <h2 className={styles.tableSectionTitle}>
                        <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Stage 5 — Exam Schedule
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        14 May 2026 — 30 June 2026
                    </span>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.examTable}>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Date</th>
                                <th>Exam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allDates.map((date) => {
                                const key = toKey(date);
                                const exam = examByDate(date);
                                const isExam = !!exam;

                                // for free days, find the next exam
                                const nextExam = !isExam ? nextExamAfter(date) : null;
                                // only show topic picker on free days that have an upcoming exam AFTER today
                                const nextExamIsAfterThisDay = nextExam && toKey(new Date(nextExam.examDate)) !== key;
                                const topics = nextExamIsAfterThisDay ? topicsForMain(nextExam!.sourceMainSubjectId) : [];
                                const dayChecked = sel[key] || [];
                                const isDropdownOpen = openDropdown === key;

                                return (
                                    <tr key={key} className={isExam ? styles.examRow : styles.freeRow}>
                                        <td className={styles.dayCell}>{fmtDay(date)}</td>
                                        <td className={styles.dateCell}>{fmtDate(date)}</td>
                                        <td
                                            className={isExam ? styles.examCell : (topics.length > 0 ? styles.freeCell : '')}
                                            style={isExam ? { background: exam!.color + '22', borderLeft: `4px solid ${exam!.color}` } : undefined}
                                        >
                                            {isExam ? (
                                                <div className={styles.examCellContent}>
                                                    <span className={styles.examCellName} style={{ color: exam!.color }}>
                                                        {exam!.title}
                                                    </span>
                                                    {isAdmin && (
                                                        <div className={styles.examCellActions}>
                                                            <button
                                                                className={styles.miniBtn}
                                                                onClick={() => openAssign(date)}
                                                                title="Change"
                                                            >
                                                                <Calendar size={12} />
                                                            </button>
                                                            <button
                                                                className={`${styles.miniBtn} ${styles.miniBtnDanger}`}
                                                                onClick={() => removeExam(exam!.id)}
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : topics.length > 0 ? (
                                                /* Free day with upcoming exam → topic picker */
                                                <div className={styles.topicPickerWrap} ref={isDropdownOpen ? dropdownRef : null}>
                                                    <button
                                                        className={styles.topicPickerBtn}
                                                        onClick={() => setOpenDropdown(isDropdownOpen ? null : key)}
                                                    >
                                                        {dayChecked.length > 0
                                                            ? <span className={styles.topicPickerCount}>{dayChecked.length} topic{dayChecked.length !== 1 ? 's' : ''} selected</span>
                                                            : <span className={styles.topicPickerPlaceholder}>Select topics to study...</span>
                                                        }
                                                        <span className={`${styles.topicPickerArrow} ${isDropdownOpen ? styles.topicPickerArrowOpen : ''}`}>▾</span>
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <div className={styles.topicDropdown}>
                                                            <div className={styles.topicDropdownHeader}>
                                                                <span>Topics for: <strong style={{ color: nextExam!.color }}>{nextExam!.title}</strong></span>
                                                            </div>
                                                            <div className={styles.topicDropdownList}>
                                                                {topics.map(t => (
                                                                    <label key={t.id} className={styles.topicDropdownItem}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.topicCb}
                                                                            checked={dayChecked.includes(t.id)}
                                                                            onChange={() => toggleTopic(key, t.id)}
                                                                        />
                                                                        <span className={styles.topicDropdownText}>
                                                                            <span className={styles.topicName}>{t.title}</span>
                                                                            <span className={styles.topicSub} style={{ color: t.subjectColor }}>{t.subjectTitle}</span>
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* show checked topics as small tags below the button */}
                                                    {dayChecked.length > 0 && !isDropdownOpen && (
                                                        <div className={styles.checkedTags}>
                                                            {dayChecked.map(tid => {
                                                                const t = topics.find(x => x.id === tid);
                                                                return t ? (
                                                                    <span key={tid} className={styles.checkedTag}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.tagCb}
                                                                            checked
                                                                            onChange={() => toggleTopic(key, tid)}
                                                                        />
                                                                        {t.title}
                                                                    </span>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* free day with no upcoming exam, or admin empty cell */
                                                isAdmin ? (
                                                    <button className={styles.assignBtn} onClick={() => openAssign(date)}>
                                                        + Set Exam
                                                    </button>
                                                ) : null
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Progress Summary */}
            {progress.length > 0 && (
                <div className={styles.progressSection}>
                    <h2 className={styles.progressSectionTitle}>
                        <BarChart3 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Progress Summary
                    </h2>
                    <div className={styles.progressCards}>
                        {progress.map(g => {
                            const pct = g.totalTopics > 0 ? Math.round((g.checkedCount / g.totalTopics) * 100) : 0;
                            return (
                                <div key={g.exam.id} className={styles.progressCard}>
                                    <div className={styles.progressCardHeader}>
                                        <div className={styles.progressDot} style={{ background: g.exam.color }} />
                                        <h3 className={styles.progressCardTitle}>{g.exam.title}</h3>
                                    </div>
                                    <div className={styles.progressCardStats}>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue}>{g.totalTopics}</div>
                                            <div className={styles.progressStatLabel}>Total</div>
                                        </div>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue} style={{ color: '#10b981' }}>{g.checkedCount}</div>
                                            <div className={styles.progressStatLabel}>Planned</div>
                                        </div>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue} style={{ color: '#f59e0b' }}>{g.totalTopics - g.checkedCount}</div>
                                            <div className={styles.progressStatLabel}>Left</div>
                                        </div>
                                    </div>
                                    <div className={styles.progressBarWrap}>
                                        <div className={styles.progressBarTrack}>
                                            <div
                                                className={`${styles.progressBarFill} ${pct >= 75 ? styles.progressBarFillHigh : pct >= 40 ? '' : styles.progressBarFillLow}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                        <span className={styles.progressBarPct}>{Math.min(pct, 100)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Admin: Pick main subject modal */}
            <Modal isOpen={!!assignDate} onClose={() => { setAssignDate(null); setPickMsId(''); }} title={`Set Exam — ${assignDate ? fmtDate(assignDate) : ''}`}>
                {assignDate && (
                    <div className={styles.assignModal}>
                        <p className={styles.assignHint}>
                            Choose a main subject from the To‑Do list to mark this day as an exam.
                        </p>
                        <div className={styles.formGroup}>
                            <label>Main Subject</label>
                            <select value={pickMsId} onChange={e => setPickMsId(e.target.value)}>
                                <option value="">— Select —</option>
                                {mainSubjects.map(ms => (
                                    <option key={ms.id} value={ms.id}>{ms.title}</option>
                                ))}
                            </select>
                        </div>
                        {pickMsId && (() => {
                            const ms = mainSubjects.find(m => m.id === pickMsId);
                            const topics = topicsForMain(pickMsId);
                            return (
                                <div className={styles.assignPreview}>
                                    <div className={styles.assignPreviewDot} style={{ background: ms?.color }} />
                                    <span>{ms?.title} — {topics.length} topic{topics.length !== 1 ? 's' : ''}</span>
                                </div>
                            );
                        })()}
                        <div className={styles.formActions}>
                            <Button variant="outline" onClick={() => { setAssignDate(null); setPickMsId(''); }}>Cancel</Button>
                            <Button variant="primary" onClick={doAssign} disabled={!pickMsId}>
                                {examByDate(assignDate) ? 'Update' : 'Set Exam'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
