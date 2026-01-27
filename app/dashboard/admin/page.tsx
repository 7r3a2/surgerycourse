'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield, Users, Trash2, Key, Plus, Search, BookOpen,
    FolderPlus, FileText, ChevronUp, ChevronDown,
    Trash, ChevronRight, Pencil
} from 'lucide-react';
import { useAuth, User } from '@/contexts/AuthContext';
import { useTodo, MainSubject, Subject, Topic } from '@/contexts/TodoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import styles from './page.module.css';

export default function AdminPage() {
    const router = useRouter();
    const { currentUser, isAdmin, users, deleteUser, resetUserPassword } = useAuth();
    const {
        mainSubjects, addMainSubject, addSubject, addTopic,
        updateMainSubject, updateSubject, updateTopic,
        getTotalProgress,
        deleteMainSubject, deleteSubject, deleteTopic,
        reorderMainSubjects, reorderSubjects, reorderTopics
    } = useTodo();

    // User filter/search
    const [userSearchText, setUserSearchText] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

    // Add Modal states
    const [isAddMainSubjectOpen, setIsAddMainSubjectOpen] = useState(false);
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
    const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);

    // Edit Modal states
    const [isEditMainSubjectOpen, setIsEditMainSubjectOpen] = useState(false);
    const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
    const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);

    // Form states
    const [mainSubjectForm, setMainSubjectForm] = useState({ title: '', description: '', color: '#0d9488' });
    const [subjectForm, setSubjectForm] = useState({ title: '', description: '', color: '#3b82f6' });
    const [topicForm, setTopicForm] = useState({ title: '' });

    // Edit Form states
    const [editingMainSubject, setEditingMainSubject] = useState<MainSubject | null>(null);
    const [editingSubject, setEditingSubject] = useState<{ msId: string, subject: Subject } | null>(null);
    const [editingTopic, setEditingTopic] = useState<{ msId: string, sId: string, topic: Topic } | null>(null);

    const [selectedMainSubjectId, setSelectedMainSubjectId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

    // Collapse states
    const [expandedMainSubjects, setExpandedMainSubjects] = useState<Set<string>>(new Set());
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

    const toggleMainSubject = (id: string) => {
        setExpandedMainSubjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(userSearchText.toLowerCase());
        const matchesRole = userRoleFilter === 'all' ||
            (userRoleFilter === 'admin' && user.isAdmin) ||
            (userRoleFilter === 'user' && !user.isAdmin);
        return matchesSearch && matchesRole;
    });

    const handleDeleteUser = async (user: User) => {
        if (user.id === currentUser?.id) {
            alert('You cannot delete your own account!');
            return;
        }
        if (user.isAdmin && users.filter(u => u.isAdmin).length <= 1) {
            alert('Cannot delete the last admin account!');
            return;
        }
        if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
            await deleteUser(user.id);
        }
    };

    const handleResetPassword = async (user: User) => {
        const newPassword = prompt(`Enter new password for "${user.username}":`);
        if (newPassword && newPassword.length >= 4) {
            await resetUserPassword(user.id, newPassword);
            alert(`Password for "${user.username}" has been reset.`);
        } else if (newPassword) {
            alert('Password must be at least 4 characters.');
        }
    };

    const handleAddMainSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mainSubjectForm.title.trim()) {
            await addMainSubject(mainSubjectForm.title, mainSubjectForm.description, mainSubjectForm.color);
            setMainSubjectForm({ title: '', description: '', color: '#0d9488' });
            setIsAddMainSubjectOpen(false);
        }
    };

    const handleUpdateMainSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMainSubject && editingMainSubject.title.trim()) {
            await updateMainSubject(editingMainSubject.id, editingMainSubject.title, editingMainSubject.description, editingMainSubject.color);
            setIsEditMainSubjectOpen(false);
            setEditingMainSubject(null);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (subjectForm.title.trim() && selectedMainSubjectId) {
            await addSubject(selectedMainSubjectId, subjectForm.title, subjectForm.description, subjectForm.color);
            setSubjectForm({ title: '', description: '', color: '#3b82f6' });
            setIsAddSubjectOpen(false);
        }
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSubject && editingSubject.subject.title.trim()) {
            await updateSubject(editingSubject.msId, editingSubject.subject.id, editingSubject.subject.title, editingSubject.subject.description, editingSubject.subject.color);
            setIsEditSubjectOpen(false);
            setEditingSubject(null);
        }
    };

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (topicForm.title.trim() && selectedMainSubjectId && selectedSubjectId) {
            await addTopic(selectedMainSubjectId, selectedSubjectId, topicForm.title);
            setTopicForm({ title: '' });
            setIsAddTopicOpen(false);
        }
    };

    const handleUpdateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTopic && editingTopic.topic.title.trim()) {
            await updateTopic(editingTopic.msId, editingTopic.sId, editingTopic.topic.id, editingTopic.topic.title);
            setIsEditTopicOpen(false);
            setEditingTopic(null);
        }
    };

    // Reorder Handlers
    const moveMainSubject = (index: number, direction: 'up' | 'down') => {
        const newItems = [...mainSubjects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        reorderMainSubjects(newItems);
    };

    const moveSubject = (msId: string, index: number, direction: 'up' | 'down') => {
        const ms = mainSubjects.find(m => m.id === msId);
        if (!ms) return;
        const newItems = [...ms.subjects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        reorderSubjects(msId, newItems);
    };

    const moveTopic = (msId: string, sId: string, index: number, direction: 'up' | 'down') => {
        const ms = mainSubjects.find(m => m.id === msId);
        const s = ms?.subjects.find(sub => sub.id === sId);
        if (!s) return;
        const newItems = [...s.topics];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        reorderTopics(msId, sId, newItems);
    };

    const progress = getTotalProgress();

    return (
        <div className={styles.container}>
            <BackButton />
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Shield size={40} />
                </div>
                <div>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <p className={styles.subtitle}>Manage users and subjects for all users</p>
                </div>
            </header>

            {/* Stats */}
            <div className={styles.stats}>
                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                            <Users size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Total Users</div>
                            <div className={styles.statValue}>{users.length}</div>
                        </div>
                    </div>
                </Card>
                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' }}>
                            <Shield size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Admins</div>
                            <div className={styles.statValue}>{users.filter(u => u.isAdmin).length}</div>
                        </div>
                    </div>
                </Card>
                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Main Subjects</div>
                            <div className={styles.statValue}>{mainSubjects.length}</div>
                        </div>
                    </div>
                </Card>
                <Card variant="bordered">
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>
                            <FileText size={24} color="white" />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Total Topics</div>
                            <div className={styles.statValue}>{progress.total}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Subject Management Section */}
            <Card variant="bordered" className={styles.tableCard}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.tableTitle}>📚 Subject Management (For All Users)</h2>
                    <p className={styles.sectionSubtitle}>Add, remove, edit, and reorder subjects here</p>
                </div>
                <div className={styles.subjectActions}>
                    <Button onClick={() => setIsAddMainSubjectOpen(true)} icon={<FolderPlus size={18} />}>
                        Add Main Subject
                    </Button>
                    <Button
                        onClick={() => setIsAddSubjectOpen(true)}
                        variant="outline"
                        icon={<Plus size={18} />}
                        disabled={mainSubjects.length === 0}
                    >
                        Add Subject
                    </Button>
                    <Button
                        onClick={() => setIsAddTopicOpen(true)}
                        variant="outline"
                        icon={<FileText size={18} />}
                        disabled={mainSubjects.length === 0}
                    >
                        Add Topic
                    </Button>
                </div>

                {/* Interactive Subject Management */}
                {mainSubjects.length > 0 && (
                    <div className={styles.managementList}>
                        {mainSubjects.map((ms, msIndex) => (
                            <div key={ms.id} className={styles.mainSubjectGroup}>
                                <div className={styles.mainSubjectHeader}>
                                    <ChevronRight
                                        size={20}
                                        className={`${styles.expandIcon} ${expandedMainSubjects.has(ms.id) ? styles.expanded : ''}`}
                                        onClick={() => toggleMainSubject(ms.id)}
                                    />
                                    <div className={styles.subjectColor} style={{ backgroundColor: ms.color }} />
                                    <span className={styles.subjectName} onClick={() => toggleMainSubject(ms.id)} style={{ cursor: 'pointer' }}>
                                        {ms.title}
                                    </span>
                                    <div className={styles.reorderButtons}>
                                        <Button size="small" variant="outline" onClick={() => moveMainSubject(msIndex, 'up')} disabled={msIndex === 0}>
                                            <ChevronUp size={14} />
                                        </Button>
                                        <Button size="small" variant="outline" onClick={() => moveMainSubject(msIndex, 'down')} disabled={msIndex === mainSubjects.length - 1}>
                                            <ChevronDown size={14} />
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outline"
                                            onClick={() => { setEditingMainSubject(ms); setIsEditMainSubjectOpen(true); }}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outline"
                                            className={styles.deleteButtonCompact}
                                            onClick={() => confirm(`Are you sure? This will delete "${ms.title}" and EVERYTHING inside it.`) && deleteMainSubject(ms.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>

                                {expandedMainSubjects.has(ms.id) && ms.subjects.map((s, sIndex) => (
                                    <div key={s.id} className={styles.subjectGroup}>
                                        <div className={styles.subjectHeader}>
                                            <ChevronRight
                                                size={18}
                                                className={`${styles.expandIcon} ${expandedSubjects.has(s.id) ? styles.expanded : ''}`}
                                                onClick={() => toggleSubject(s.id)}
                                            />
                                            <BookOpen size={16} color={s.color} />
                                            <span className={styles.subjectName} onClick={() => toggleSubject(s.id)} style={{ cursor: 'pointer' }}>
                                                {s.title}
                                            </span>
                                            <div className={styles.reorderButtons}>
                                                <Button size="small" variant="outline" onClick={() => moveSubject(ms.id, sIndex, 'up')} disabled={sIndex === 0}>
                                                    <ChevronUp size={14} />
                                                </Button>
                                                <Button size="small" variant="outline" onClick={() => moveSubject(ms.id, sIndex, 'down')} disabled={sIndex === ms.subjects.length - 1}>
                                                    <ChevronDown size={14} />
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outline"
                                                    onClick={() => { setEditingSubject({ msId: ms.id, subject: s }); setIsEditSubjectOpen(true); }}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outline"
                                                    className={styles.deleteButtonCompact}
                                                    onClick={() => confirm(`Delete subject "${s.title}"?`) && deleteSubject(ms.id, s.id)}
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedSubjects.has(s.id) && (
                                            <div className={styles.topicList}>
                                                {s.topics.map((t, tIndex) => (
                                                    <div key={t.id} className={styles.topicItem}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FileText size={14} color="#94a3b8" />
                                                            <span>{t.title}</span>
                                                        </div>
                                                        <div className={styles.reorderButtons}>
                                                            <Button size="small" variant="outline" onClick={() => moveTopic(ms.id, s.id, tIndex, 'up')} disabled={tIndex === 0}>
                                                                <ChevronUp size={12} />
                                                            </Button>
                                                            <Button size="small" variant="outline" onClick={() => moveTopic(ms.id, s.id, tIndex, 'down')} disabled={tIndex === s.topics.length - 1}>
                                                                <ChevronDown size={12} />
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outline"
                                                                onClick={() => { setEditingTopic({ msId: ms.id, sId: s.id, topic: t }); setIsEditTopicOpen(true); }}
                                                            >
                                                                <Pencil size={12} />
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outline"
                                                                className={styles.deleteButtonCompact}
                                                                onClick={() => confirm(`Delete topic "${t.title}"?`) && deleteTopic(ms.id, s.id, t.id)}
                                                            >
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Users Table */}
            <Card variant="bordered" className={styles.tableCard}>
                <h2 className={styles.tableTitle}>👥 User Management</h2>

                <div className={styles.filterSection}>
                    <div className={styles.searchInput}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchText}
                            onChange={(e) => setUserSearchText(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.roleFilter}
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins Only</option>
                        <option value="user">Users Only</option>
                    </select>
                </div>

                <div className={styles.filterInfo}>
                    Showing {filteredUsers.length} of {users.length} users
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userName}>
                                            {user.username}
                                            {user.id === currentUser?.id && (
                                                <span className={styles.youBadge}>(You)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {user.isAdmin ? (
                                            <span className={styles.adminBadge}>
                                                <Shield size={12} />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className={styles.userBadge}>User</span>
                                        )}
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Button
                                                variant="outline"
                                                size="small"
                                                onClick={() => handleResetPassword(user)}
                                                icon={<Key size={14} />}
                                            >
                                                Reset
                                            </Button>
                                            {user.id !== currentUser?.id && (
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => handleDeleteUser(user)}
                                                    icon={<Trash2 size={14} />}
                                                    className={styles.deleteButton}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Info Card */}
            <Card variant="bordered" className={styles.infoCard}>
                <h3>Admin Information</h3>
                <ul>
                    <li>Subjects added here will appear for <strong>ALL users</strong></li>
                    <li>Each user tracks their own completion progress separately</li>
                    <li>Regular users can only view and complete topics, not edit them</li>
                </ul>
            </Card>

            {/* --- ADD MODALS --- */}

            <Modal isOpen={isAddMainSubjectOpen} onClose={() => setIsAddMainSubjectOpen(false)} title="Add Main Subject">
                <form onSubmit={handleAddMainSubject} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Main Subject Title (e.g. Surgery)"
                        value={mainSubjectForm.title}
                        onChange={(e) => setMainSubjectForm({ ...mainSubjectForm, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={mainSubjectForm.description}
                        onChange={(e) => setMainSubjectForm({ ...mainSubjectForm, description: e.target.value })}
                        rows={3}
                    />
                    <div className={styles.colorPicker}>
                        <label>Color:</label>
                        <input
                            type="color"
                            value={mainSubjectForm.color}
                            onChange={(e) => setMainSubjectForm({ ...mainSubjectForm, color: e.target.value })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsAddMainSubjectOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Main Subject</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAddSubjectOpen} onClose={() => setIsAddSubjectOpen(false)} title="Add Subject">
                <form onSubmit={handleAddSubject} className={styles.form}>
                    <select
                        value={selectedMainSubjectId}
                        onChange={(e) => setSelectedMainSubjectId(e.target.value)}
                        required
                        className={styles.selectInput}
                    >
                        <option value="">Select Main Subject</option>
                        {mainSubjects.map(ms => (
                            <option key={ms.id} value={ms.id}>{ms.title}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Subject Title (e.g. Pediatric Surgery)"
                        value={subjectForm.title}
                        onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                        rows={3}
                    />
                    <div className={styles.colorPicker}>
                        <label>Color:</label>
                        <input
                            type="color"
                            value={subjectForm.color}
                            onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsAddSubjectOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Subject</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAddTopicOpen} onClose={() => setIsAddTopicOpen(false)} title="Add Topic">
                <form onSubmit={handleAddTopic} className={styles.form}>
                    <select
                        value={selectedMainSubjectId}
                        onChange={(e) => {
                            setSelectedMainSubjectId(e.target.value);
                            setSelectedSubjectId('');
                        }}
                        required
                        className={styles.selectInput}
                    >
                        <option value="">Select Main Subject</option>
                        {mainSubjects.map(ms => (
                            <option key={ms.id} value={ms.id}>{ms.title}</option>
                        ))}
                    </select>
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        required
                        disabled={!selectedMainSubjectId}
                        className={styles.selectInput}
                    >
                        <option value="">Select Subject</option>
                        {mainSubjects.find(ms => ms.id === selectedMainSubjectId)?.subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Topic Title"
                        value={topicForm.title}
                        onChange={(e) => setTopicForm({ title: e.target.value })}
                        required
                    />
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsAddTopicOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Topic</Button>
                    </div>
                </form>
            </Modal>

            {/* --- EDIT MODALS --- */}

            <Modal isOpen={isEditMainSubjectOpen} onClose={() => setIsEditMainSubjectOpen(false)} title="Edit Main Subject">
                {editingMainSubject && (
                    <form onSubmit={handleUpdateMainSubject} className={styles.form}>
                        <input
                            type="text"
                            value={editingMainSubject.title}
                            onChange={(e) => setEditingMainSubject({ ...editingMainSubject, title: e.target.value })}
                            required
                        />
                        <textarea
                            value={editingMainSubject.description || ''}
                            onChange={(e) => setEditingMainSubject({ ...editingMainSubject, description: e.target.value })}
                            rows={3}
                        />
                        <div className={styles.colorPicker}>
                            <label>Color:</label>
                            <input
                                type="color"
                                value={editingMainSubject.color}
                                onChange={(e) => setEditingMainSubject({ ...editingMainSubject, color: e.target.value })}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsEditMainSubjectOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isEditSubjectOpen} onClose={() => setIsEditSubjectOpen(false)} title="Edit Subject">
                {editingSubject && (
                    <form onSubmit={handleUpdateSubject} className={styles.form}>
                        <input
                            type="text"
                            value={editingSubject.subject.title}
                            onChange={(e) => setEditingSubject({ ...editingSubject, subject: { ...editingSubject.subject, title: e.target.value } })}
                            required
                        />
                        <textarea
                            value={editingSubject.subject.description || ''}
                            onChange={(e) => setEditingSubject({ ...editingSubject, subject: { ...editingSubject.subject, description: e.target.value } })}
                            rows={3}
                        />
                        <div className={styles.colorPicker}>
                            <label>Color:</label>
                            <input
                                type="color"
                                value={editingSubject.subject.color}
                                onChange={(e) => setEditingSubject({ ...editingSubject, subject: { ...editingSubject.subject, color: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsEditSubjectOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isEditTopicOpen} onClose={() => setIsEditTopicOpen(false)} title="Edit Topic">
                {editingTopic && (
                    <form onSubmit={handleUpdateTopic} className={styles.form}>
                        <input
                            type="text"
                            value={editingTopic.topic.title}
                            onChange={(e) => setEditingTopic({ ...editingTopic, topic: { ...editingTopic.topic, title: e.target.value } })}
                            required
                        />
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsEditTopicOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
