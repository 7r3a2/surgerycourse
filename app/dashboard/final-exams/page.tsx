'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTodo } from '@/contexts/TodoContext';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
    GraduationCap, Calendar, Trash2, BarChart3, Clock,
    BookOpen, CheckCircle2, Circle, Plus, ChevronDown
} from 'lucide-react';
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

interface DayTopicItem {
    id: string;       // topic id or custom-<uuid>
    title: string;
    checked: boolean;
    isCustom?: boolean;
}

// day-key → list of topic items
type DayData = Record<string, DayTopicItem[]>;

// ── Constants ──────────────────────────────────────────────────────────────────

const SCHEDULE_START = new Date(2026, 4, 14);
const SCHEDULE_END   = new Date(2026, 5, 30);

// ── Helpers ────────────────────────────────────────────────────────────────────

const sKey = (uid: string) => `final-exams-v2-${uid}`;
const loadLocal = (uid: string): DayData => {
    try { return JSON.parse(localStorage.getItem(sKey(uid)) || '{}'); } catch { return {}; }
};
const saveLocal = (uid: string, d: DayData) => localStorage.setItem(sKey(uid), JSON.stringify(d));

async function loadServer(uid: string): Promise<DayData> {
    try {
        const r = await fetch(`/api/final-exams/day-data?userId=${uid}`);
        if (r.ok) return await r.json();
    } catch (e) { console.error('Failed to load day data from server:', e); }
    return {};
}

async function saveServer(uid: string, d: DayData) {
    try {
        await fetch(`/api/final-exams/day-data?userId=${uid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(d),
        });
    } catch (e) { console.error('Failed to save day data to server:', e); }
}

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

function daysUntil(dateStr: string): number {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const e = new Date(dateStr); e.setHours(0, 0, 0, 0);
    return Math.ceil((e.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function uuid() { return Math.random().toString(36).substring(2, 10); }

// ── Component ──────────────────────────────────────────────────────────────────

export default function FinalExamsPage() {
    const { currentUser, isAdmin } = useAuth();
    const { mainSubjects } = useTodo();
    const [exams, setExams] = useState<ExamEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [dayData, setDayData] = useState<DayData>({});

    // admin assign
    const [assignDate, setAssignDate] = useState<Date | null>(null);
    const [pickMsId, setPickMsId] = useState('');

    // topic picker dropdown
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // custom topic input per day
    const [customInput, setCustomInput] = useState<Record<string, string>>({});

    const allDates = buildDates();

    // (page is visible to all users)

    // ── fetch ────────────────────────────────────────────────────────────────

    const fetchExams = useCallback(async () => {
        try {
            const r = await fetch('/api/final-exams/subjects');
            if (r.ok) setExams(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchExams(); }, [fetchExams]);

    useEffect(() => {
        if (!currentUser) return;
        const uid = currentUser.id;
        (async () => {
            const serverData = await loadServer(uid);
            const localData = loadLocal(uid);
            const hasServer = Object.keys(serverData).length > 0;
            const hasLocal = Object.keys(localData).length > 0;

            if (hasServer) {
                // Server is source of truth — use it, update local cache
                setDayData(serverData);
                saveLocal(uid, serverData);
            } else if (hasLocal) {
                // First time: migrate localStorage data to server
                setDayData(localData);
                await saveServer(uid, localData);
            } else {
                setDayData({});
            }
        })();
    }, [currentUser]);

    const persist = useCallback((next: DayData) => {
        if (!currentUser) return;
        setDayData(next);
        saveLocal(currentUser.id, next);
        saveServer(currentUser.id, next);
    }, [currentUser]);

    // click outside closes dropdown
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpenDropdown(null);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // ── helpers ──────────────────────────────────────────────────────────────

    const examByDate = (d: Date): ExamEntry | undefined => {
        const k = toKey(d);
        return exams.find(e => toKey(new Date(e.examDate)) === k);
    };

    const nextExamAfter = (d: Date): ExamEntry | undefined => {
        const t = d.getTime();
        return exams
            .filter(e => new Date(e.examDate).getTime() > t)
            .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];
    };

    const topicsForMain = (msId: string | null) => {
        if (!msId) return [];
        const ms = mainSubjects.find(m => m.id === msId);
        if (!ms) return [];
        return ms.subjects.flatMap(s =>
            s.topics.map(t => ({ ...t, subjectTitle: s.title, subjectColor: s.color }))
        );
    };

    // collect all topic IDs already used across ALL free days for a given exam
    const usedTopicIdsForExam = (exam: ExamEntry): Set<string> => {
        const used = new Set<string>();
        for (const d of allDates) {
            if (examByDate(d)) continue;
            const ne = nextExamAfter(d);
            if (!ne || ne.id !== exam.id) continue;
            const items = dayData[toKey(d)] || [];
            items.forEach(i => used.add(i.id));
        }
        return used;
    };

    // count all checked topics across free days for a given exam
    const examProgress = (exam: ExamEntry) => {
        const allTopics = topicsForMain(exam.sourceMainSubjectId);
        const totalAvailable = allTopics.length;
        let totalChecked = 0;
        let totalAdded = 0;
        for (const d of allDates) {
            if (examByDate(d)) continue;
            const ne = nextExamAfter(d);
            if (!ne || ne.id !== exam.id) continue;
            const items = dayData[toKey(d)] || [];
            totalAdded += items.length;
            totalChecked += items.filter(i => i.checked).length;
        }
        const allDone = totalAdded > 0 && totalChecked === totalAdded;
        return { totalAvailable, totalAdded, totalChecked, allDone };
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
            title: ms.title, examDate: assignDate.toISOString(),
            color: ms.color, sourceSubjectId: null, sourceMainSubjectId: ms.id,
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
        setAssignDate(null); setPickMsId('');
    };

    const removeExam = async (id: string) => {
        if (!confirm('Remove this exam?')) return;
        try {
            await fetch(`/api/final-exams/subjects/${id}`, { method: 'DELETE' });
            setExams(prev => prev.filter(e => e.id !== id));
        } catch (e) { console.error(e); }
    };

    // ── topic actions (to-do style) ──────────────────────────────────────────

    const addTopicToDay = (dayKey: string, topicId: string, title: string) => {
        const items = dayData[dayKey] || [];
        if (items.some(i => i.id === topicId)) return; // already added
        persist({ ...dayData, [dayKey]: [...items, { id: topicId, title, checked: false }] });
    };

    const addCustomTopic = (dayKey: string) => {
        const text = (customInput[dayKey] || '').trim();
        if (!text) return;
        const items = dayData[dayKey] || [];
        persist({ ...dayData, [dayKey]: [...items, { id: `custom-${uuid()}`, title: text, checked: false, isCustom: true }] });
        setCustomInput(prev => ({ ...prev, [dayKey]: '' }));
    };

    const toggleItem = (dayKey: string, itemId: string) => {
        const items = dayData[dayKey] || [];
        persist({
            ...dayData,
            [dayKey]: items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i),
        });
    };

    const removeItem = (dayKey: string, itemId: string) => {
        const items = dayData[dayKey] || [];
        persist({ ...dayData, [dayKey]: items.filter(i => i.id !== itemId) });
    };

    // ── render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className={styles.container}>
                <BackButton />
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading...</p>
            </div>
        );
    }

    // build progress for summary
    const examProgressList = exams.map(e => ({ exam: e, ...examProgress(e) }));

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
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>14 May 2026 — 30 June 2026</span>
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
                                const nextExam = !isExam ? nextExamAfter(date) : null;
                                const topics = nextExam ? topicsForMain(nextExam.sourceMainSubjectId) : [];
                                const dayItems = dayData[key] || [];
                                const isDropdownOpen = openDropdown === key;
                                const checkedCount = dayItems.filter(i => i.checked).length;
                                // all topic IDs already used on ANY day for this exam
                                const usedIds = nextExam ? usedTopicIdsForExam(nextExam) : new Set<string>();

                                return (
                                    <tr key={key} className={isExam ? styles.examRow : styles.freeRow}>
                                        <td className={styles.dayCell}>{fmtDay(date)}</td>
                                        <td className={styles.dateCell}>{fmtDate(date)}</td>
                                        <td
                                            className={isExam ? styles.examCell : (nextExam ? styles.freeCell : '')}
                                            style={isExam ? { background: exam!.color + '18', borderLeft: `4px solid ${exam!.color}` } : undefined}
                                        >
                                            {isExam ? (
                                                /* ─── Exam day cell ─── */
                                                <div className={styles.examCellWrap}>
                                                    <div className={styles.examCellTop}>
                                                        <span className={styles.examCellName} style={{ color: exam!.color }}>
                                                            {exam!.title}
                                                        </span>
                                                        {isAdmin && (
                                                            <div className={styles.examCellActions}>
                                                                <button className={styles.miniBtn} onClick={() => openAssign(date)} title="Change">
                                                                    <Calendar size={12} />
                                                                </button>
                                                                <button className={`${styles.miniBtn} ${styles.miniBtnDanger}`} onClick={() => removeExam(exam!.id)} title="Remove">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Exam info badges */}
                                                    <div className={styles.examInfoRow}>
                                                        {(() => {
                                                            const days = daysUntil(exam!.examDate);
                                                            const prog = examProgress(exam!);
                                                            const allTopics = topicsForMain(exam!.sourceMainSubjectId);
                                                            return (
                                                                <>
                                                                    <span className={`${styles.infoBadge} ${days <= 0 ? styles.infoBadgeRed : days <= 3 ? styles.infoBadgeOrange : styles.infoBadgeGreen}`}>
                                                                        <Clock size={11} />
                                                                        {days <= 0 ? 'Today / Passed' : `${days} day${days !== 1 ? 's' : ''} left`}
                                                                    </span>
                                                                    <span className={styles.infoBadge}>
                                                                        <BookOpen size={11} />
                                                                        {allTopics.length} topic{allTopics.length !== 1 ? 's' : ''}
                                                                    </span>
                                                                    <span className={`${styles.infoBadge} ${prog.allDone ? styles.infoBadgeDone : ''}`}>
                                                                        {prog.allDone
                                                                            ? <><CheckCircle2 size={11} /> Done</>
                                                                            : <><Circle size={11} /> {prog.totalChecked}/{prog.totalAdded} done</>
                                                                        }
                                                                    </span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            ) : nextExam ? (
                                                /* ─── Free day cell: to-do list + dropdown ─── */
                                                <div className={styles.freeCellWrap}>
                                                    {/* To-do checklist */}
                                                    {dayItems.length > 0 && (
                                                        <div className={styles.todoList}>
                                                            {dayItems.map(item => (
                                                                <div key={item.id} className={`${styles.todoItem} ${item.checked ? styles.todoItemDone : ''}`}>
                                                                    <button
                                                                        className={styles.todoCheck}
                                                                        onClick={() => toggleItem(key, item.id)}
                                                                    >
                                                                        {item.checked
                                                                            ? <CheckCircle2 size={16} color="#10b981" />
                                                                            : <Circle size={16} color="#d1d5db" />
                                                                        }
                                                                    </button>
                                                                    <span className={styles.todoText}>{item.title}</span>
                                                                    <button className={styles.todoRemove} onClick={() => removeItem(key, item.id)} title="Remove">
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add from existing topics dropdown */}
                                                    <div className={styles.addRow} ref={isDropdownOpen ? dropdownRef : null}>
                                                        <button
                                                            className={styles.addDropdownBtn}
                                                            onClick={() => setOpenDropdown(isDropdownOpen ? null : key)}
                                                        >
                                                            <Plus size={13} />
                                                            <span>Add topic</span>
                                                            <ChevronDown size={12} className={`${styles.addArrow} ${isDropdownOpen ? styles.addArrowOpen : ''}`} />
                                                        </button>

                                                        {isDropdownOpen && topics.length > 0 && (
                                                            <div className={styles.topicDropdown}>
                                                                <div className={styles.topicDropdownHeader}>
                                                                    Topics from <strong style={{ color: nextExam.color }}>{nextExam.title}</strong>
                                                                </div>
                                                                <div className={styles.topicDropdownList}>
                                                                    {topics.map(t => {
                                                                        const usedOnAnyDay = usedIds.has(t.id);
                                                                        return (
                                                                            <button
                                                                                key={t.id}
                                                                                className={`${styles.topicDropdownItem} ${usedOnAnyDay ? styles.topicDropdownItemAdded : ''}`}
                                                                                onClick={() => { if (!usedOnAnyDay) addTopicToDay(key, t.id, t.title); }}
                                                                                disabled={usedOnAnyDay}
                                                                            >
                                                                                <span className={styles.topicName}>{t.title}</span>
                                                                                <span className={styles.topicSub} style={{ color: t.subjectColor }}>{t.subjectTitle}</span>
                                                                                {usedOnAnyDay && <span className={styles.topicAdded}>Added</span>}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {/* Custom topic input inside dropdown */}
                                                                <div className={styles.customInputWrap}>
                                                                    <input
                                                                        className={styles.customInput}
                                                                        type="text"
                                                                        placeholder="Or type a custom topic..."
                                                                        value={customInput[key] || ''}
                                                                        onChange={e => setCustomInput(prev => ({ ...prev, [key]: e.target.value }))}
                                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTopic(key); } }}
                                                                    />
                                                                    <button className={styles.customAddBtn} onClick={() => addCustomTopic(key)}>
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Summary line */}
                                                    {dayItems.length > 0 && (
                                                        <div className={styles.daySummary}>
                                                            {checkedCount}/{dayItems.length} done
                                                        </div>
                                                    )}
                                                </div>
                                            ) : isAdmin ? (
                                                <button className={styles.assignBtn} onClick={() => openAssign(date)}>+ Set Exam</button>
                                            ) : null}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Progress Summary */}
            {examProgressList.filter(e => e.totalAdded > 0 || e.totalAvailable > 0).length > 0 && (
                <div className={styles.progressSection}>
                    <h2 className={styles.progressSectionTitle}>
                        <BarChart3 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Progress Summary
                    </h2>
                    <div className={styles.progressCards}>
                        {examProgressList.map(g => {
                            const days = daysUntil(g.exam.examDate);
                            const pct = g.totalAdded > 0 ? Math.round((g.totalChecked / g.totalAdded) * 100) : 0;
                            return (
                                <div key={g.exam.id} className={styles.progressCard}>
                                    <div className={styles.progressCardTop}>
                                        <div className={styles.progressDot} style={{ background: g.exam.color }} />
                                        <h3 className={styles.progressCardTitle}>{g.exam.title}</h3>
                                        <span className={`${styles.progressBadge} ${g.allDone ? styles.progressBadgeDone : ''}`}>
                                            {g.allDone ? 'Done' : days <= 0 ? 'Passed' : `${days}d left`}
                                        </span>
                                    </div>
                                    <div className={styles.progressCardStats}>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue}>{g.totalAvailable}</div>
                                            <div className={styles.progressStatLabel}>Available</div>
                                        </div>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue}>{g.totalAdded}</div>
                                            <div className={styles.progressStatLabel}>Planned</div>
                                        </div>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue} style={{ color: '#10b981' }}>{g.totalChecked}</div>
                                            <div className={styles.progressStatLabel}>Done</div>
                                        </div>
                                        <div className={styles.progressStat}>
                                            <div className={styles.progressStatValue} style={{ color: g.totalAdded - g.totalChecked > 0 ? '#f59e0b' : '#10b981' }}>
                                                {g.totalAdded - g.totalChecked}
                                            </div>
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
                                        <span className={styles.progressBarPct}>{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Admin assign modal */}
            <Modal isOpen={!!assignDate} onClose={() => { setAssignDate(null); setPickMsId(''); }} title={`Set Exam — ${assignDate ? fmtDate(assignDate) : ''}`}>
                {assignDate && (
                    <div className={styles.assignModal}>
                        <p className={styles.assignHint}>Choose a main subject from the To-Do list to mark this day as an exam.</p>
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
                            const t = topicsForMain(pickMsId);
                            return (
                                <div className={styles.assignPreview}>
                                    <div className={styles.assignPreviewDot} style={{ background: ms?.color }} />
                                    <span>{ms?.title} — {t.length} topic{t.length !== 1 ? 's' : ''}</span>
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
