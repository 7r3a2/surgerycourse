'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: number; // Unix timestamp
  order: number;
  createdAt: number;
}

export interface CalendarTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: number; // Unix timestamp
  color?: string;
  createdAt: number;
  mainSubjectId?: string;
  subjectId?: string;
  subjectColor?: string;
  topicId?: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  color: string;
  topics: Topic[];
  order: number;
  createdAt: number;
}

export interface MainSubject {
  id: string;
  title: string;
  description: string;
  color: string;
  subjects: Subject[];
  order: number;
  createdAt: number;
}

// User-specific topic completion tracking
interface UserTopicCompletion {
  [topicId: string]: boolean;
}

interface TodoContextType {
  mainSubjects: MainSubject[];
  isLoading: boolean;
  addMainSubject: (title: string, description: string, color: string) => Promise<void>;
  updateMainSubject: (id: string, title: string, description: string, color: string) => void;
  deleteMainSubject: (id: string) => Promise<void>;
  addSubject: (mainSubjectId: string, title: string, description: string, color: string) => Promise<void>;
  updateSubject: (mainSubjectId: string, subjectId: string, title: string, description: string, color: string) => void;
  deleteSubject: (mainSubjectId: string, subjectId: string) => Promise<void>;
  addTopic: (mainSubjectId: string, subjectId: string, title: string, dueDate?: number) => Promise<void>;
  updateTopic: (mainSubjectId: string, subjectId: string, topicId: string, title: string) => void;
  deleteTopic: (mainSubjectId: string, subjectId: string, topicId: string) => Promise<void>;
  toggleTopic: (mainSubjectId: string, subjectId: string, topicId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getSubjectProgress: (mainSubjectId: string, subjectId: string) => { completed: number; total: number; percentage: number };
  getMainSubjectProgress: (mainSubjectId: string) => { completed: number; total: number; percentage: number };
  getTotalProgress: () => { completed: number; total: number; percentage: number };
  getTasksByDateRange: (startDate: Date, endDate: Date) => Array<Topic & { mainSubjectId: string; subjectId: string; subjectTitle: string; mainSubjectTitle: string; color: string }>;
  updateTopicDueDate: (mainSubjectId: string, subjectId: string, topicId: string, dueDate: number | undefined) => void;
  reorderMainSubjects: (reorderedMainSubjects: MainSubject[]) => void;
  reorderSubjects: (mainSubjectId: string, reorderedSubjects: Subject[]) => void;
  reorderTopics: (mainSubjectId: string, subjectId: string, reorderedTopics: Topic[]) => void;
  dayColors: Map<string, string>;
  getDayColor: (date: Date) => string | null;
  setDayColor: (date: Date, color: string) => void;
  removeDayColor: (date: Date) => void;
  calendarTasks: CalendarTask[];
  addCalendarTask: (title: string, dueDate: number, color?: string) => void;
  updateCalendarTask: (id: string, title: string, color?: string) => void;
  deleteCalendarTask: (id: string) => void;
  toggleCalendarTask: (id: string) => void;
  isTopicCompleted: (topicId: string) => boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};

// Global storage key for shared subjects (admin-managed)
const SHARED_SUBJECTS_KEY = 'surgery-shared-subjects';

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [mainSubjects, setMainSubjects] = useState<MainSubject[]>([]);
  const [userCompletions, setUserCompletions] = useState<UserTopicCompletion>({});
  const [dayColors, setDayColors] = useState<Map<string, string>>(new Map());
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load SHARED subjects and user-specific completion data from DB
  const refreshData = async () => {
    if (!currentUser) return;

    // Don't set global isLoading on background refresh to avoid flickering
    // Only set it if we have no data yet
    if (mainSubjects.length === 0) setIsLoading(true);

    try {
      // Fetch Main Subjects from API
      const subjectsRes = await fetch('/api/todo/main-subjects');
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        // Sort by order
        const sortedData = data.map((ms: any) => ({
          ...ms,
          subjects: ms.subjects?.map((s: any) => ({
            ...s,
            topics: s.topics?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || []
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || []
        })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        setMainSubjects(sortedData);
      }

      // Fetch User Completions from API
      const completionsRes = await fetch(`/api/todo/completions?userId=${currentUser.id}`);
      if (completionsRes.ok) {
        const data = await completionsRes.json();
        setUserCompletions(data);
      }

      // Fetch Calendar Tasks from API
      const tasksRes = await fetch(`/api/calendar/tasks?userId=${currentUser.id}`);
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        // Convert ISO strings back to timestamps for state consistency if needed
        setCalendarTasks(data.map((t: any) => ({
          ...t,
          dueDate: new Date(t.date).getTime()
        })));
      }

      // Fetch Day Colors from API
      const colorsRes = await fetch(`/api/calendar/day-colors?userId=${currentUser.id}`);
      if (colorsRes.ok) {
        const data = await colorsRes.json();
        const colorMap = new Map();
        data.forEach((dc: any) => {
          const dateKey = new Date(dc.date).toISOString().split('T')[0];
          colorMap.set(dateKey, dc.color);
        });
        setDayColors(colorMap);
      }

    } catch (error) {
      console.error('Error fetching data from DB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load SHARED subjects and user-specific completion data from DB
  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Persistence is now handled per-action via API calls

  const isTopicCompleted = (topicId: string): boolean => {
    return userCompletions[topicId] || false;
  };

  const addMainSubject = async (title: string, description: string, color: string) => {
    try {
      const response = await fetch('/api/todo/main-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          color,
          order: mainSubjects.length
        }),
      });
      if (response.ok) {
        const newMainSubject = await response.json();
        // Convert ISO string to timestamp if needed, but Context uses any for data from API currently
        setMainSubjects(prev => [...prev, newMainSubject]);
      } else {
        const errorData = await response.json();
        console.error('Failed to add main subject:', errorData);
        alert(`Error adding main subject: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding main subject:', error);
      alert('Failed to connect to server when adding main subject.');
    }
  };

  const updateMainSubject = async (id: string, title: string, description: string, color: string) => {
    try {
      const response = await fetch(`/api/todo/main-subjects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, color }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMainSubjects(prev =>
          prev.map(ms => ms.id === id ? { ...ms, ...updated } : ms)
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to update main subject:', errorData);
        alert(`Error updating main subject: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating main subject:', error);
      alert('Failed to connect to server when updating main subject.');
    }
  };

  const deleteMainSubject = async (id: string) => {
    console.log('TodoContext: deleteMainSubject called with id:', id);
    try {
      const response = await fetch(`/api/todo/main-subjects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMainSubjects(prev => prev.filter(ms => ms.id !== id));
      } else {
        const errorData = await response.json();
        console.error('TodoContext: deleteMainSubject failed:', errorData);
        alert(`Error deleting main subject: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting main subject:', error);
      alert('Failed to connect to server when deleting main subject.');
    }
  };

  const addSubject = async (mainSubjectId: string, title: string, description: string, color: string) => {
    try {
      const ms = mainSubjects.find(m => m.id === mainSubjectId);
      const order = ms ? ms.subjects.length : 0;
      const response = await fetch('/api/todo/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainSubjectId, title, description, color, order }),
      });
      if (response.ok) {
        const newSubject = await response.json();
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? { ...ms, subjects: [...ms.subjects, newSubject] } : ms
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to add subject:', errorData);
        alert(`Error adding subject: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to connect to server when adding subject.');
    }
  };

  const updateSubject = async (mainSubjectId: string, subjectId: string, title: string, description: string, color: string) => {
    try {
      const response = await fetch(`/api/todo/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, color }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? {
            ...ms,
            subjects: ms.subjects.map(s => s.id === subjectId ? { ...s, ...updated } : s)
          } : ms
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to update subject:', errorData);
        alert(`Error updating subject: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to connect to server when updating subject.');
    }
  };

  const deleteSubject = async (mainSubjectId: string, subjectId: string) => {
    try {
      const response = await fetch(`/api/todo/subjects/${subjectId}`, { method: 'DELETE' });
      if (response.ok) {
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? { ...ms, subjects: ms.subjects.filter(s => s.id !== subjectId) } : ms
        ));
      } else {
        const errorData = await response.json();
        console.error('TodoContext: deleteSubject failed:', errorData);
        alert(`Error deleting subject: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to connect to server when deleting subject.');
    }
  };

  const addTopic = async (mainSubjectId: string, subjectId: string, title: string, dueDate?: number) => {
    try {
      const ms = mainSubjects.find(m => m.id === mainSubjectId);
      const s = ms?.subjects.find(sub => sub.id === subjectId);
      const order = s ? s.topics.length : 0;
      const response = await fetch('/api/todo/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, title, dueDate: dueDate ? new Date(dueDate) : null, order }),
      });
      if (response.ok) {
        const newTopic = await response.json();
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? {
            ...ms,
            subjects: ms.subjects.map(s =>
              s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s
            )
          } : ms
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to add topic:', errorData);
        alert(`Error adding topic: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      alert('Failed to connect to server when adding topic.');
    }
  };

  const updateTopic = async (mainSubjectId: string, subjectId: string, topicId: string, title: string) => {
    try {
      const response = await fetch(`/api/todo/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? {
            ...ms,
            subjects: ms.subjects.map(s =>
              s.id === subjectId ? {
                ...s,
                topics: s.topics.map(t => t.id === topicId ? { ...t, ...updated } : t)
              } : s
            )
          } : ms
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to update topic:', errorData);
        alert(`Error updating topic: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Failed to connect to server when updating topic.');
    }
  };

  const deleteTopic = async (mainSubjectId: string, subjectId: string, topicId: string) => {
    console.log('TodoContext: deleteTopic called with topicId:', topicId);
    try {
      const response = await fetch(`/api/todo/topics/${topicId}`, { method: 'DELETE' });
      if (response.ok) {
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? {
            ...ms,
            subjects: ms.subjects.map(s =>
              s.id === subjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s
            )
          } : ms
        ));
        setUserCompletions(prev => {
          const next = { ...prev };
          delete next[topicId];
          return next;
        });
      } else {
        const errorData = await response.json();
        console.error('TodoContext: deleteTopic failed:', errorData);
        alert(`Error deleting topic: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to connect to server when deleting topic.');
    }
  };

  const toggleTopic = async (mainSubjectId: string, subjectId: string, topicId: string) => {
    if (!currentUser) return;

    const isCompleted = !userCompletions[topicId];

    // Update local state optimisticially
    setUserCompletions(prev => ({ ...prev, [topicId]: isCompleted }));

    try {
      await fetch('/api/todo/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, topicId, completed: isCompleted }),
      });
    } catch (error) {
      console.error('Error syncing completion to server:', error);
      // Revert local state on error
      setUserCompletions(prev => ({ ...prev, [topicId]: !isCompleted }));
    }
  };

  const getSubjectProgress = (mainSubjectId: string, subjectId: string) => {
    const mainSubject = mainSubjects.find(ms => ms.id === mainSubjectId);
    const subject = mainSubject?.subjects.find(s => s.id === subjectId);
    if (!subject) return { completed: 0, total: 0, percentage: 0 };

    const total = subject.topics.length;
    const completed = subject.topics.filter(t => isTopicCompleted(t.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const getMainSubjectProgress = (mainSubjectId: string) => {
    const mainSubject = mainSubjects.find(ms => ms.id === mainSubjectId);
    if (!mainSubject) return { completed: 0, total: 0, percentage: 0 };

    let totalTopics = 0;
    let completedTopics = 0;

    mainSubject.subjects.forEach(subject => {
      totalTopics += subject.topics.length;
      completedTopics += subject.topics.filter(t => isTopicCompleted(t.id)).length;
    });

    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return { completed: completedTopics, total: totalTopics, percentage };
  };

  const getTotalProgress = () => {
    let totalTopics = 0;
    let completedTopics = 0;

    mainSubjects.forEach(mainSubject => {
      mainSubject.subjects.forEach(subject => {
        totalTopics += subject.topics.length;
        completedTopics += subject.topics.filter(t => isTopicCompleted(t.id)).length;
      });
    });

    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return { completed: completedTopics, total: totalTopics, percentage };
  };

  const getTasksByDateRange = (startDate: Date, endDate: Date) => {
    const tasks: any[] = [];
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    mainSubjects.forEach(mainSubject => {
      mainSubject.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          // Ensure comparison works even if dates are strings
          const topicDueDate = typeof topic.dueDate === 'string'
            ? new Date(topic.dueDate).getTime()
            : topic.dueDate;

          if (topicDueDate && topicDueDate >= startTime && topicDueDate <= endTime) {
            tasks.push({
              ...topic,
              completed: isTopicCompleted(topic.id),
              mainSubjectId: mainSubject.id,
              subjectId: subject.id,
              subjectTitle: subject.title,
              mainSubjectTitle: mainSubject.title,
              color: subject.color,
              // Ensure we pass the numeric timestamp 
              dueDate: topicDueDate
            });
          }
        });
      });
    });

    return tasks.sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  };

  const updateTopicDueDate = async (mainSubjectId: string, subjectId: string, topicId: string, dueDate: number | undefined) => {
    try {
      const response = await fetch(`/api/todo/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: dueDate ? new Date(dueDate).toISOString() : null }),
      });

      if (response.ok) {
        setMainSubjects(prev => prev.map(ms =>
          ms.id === mainSubjectId ? {
            ...ms,
            subjects: ms.subjects.map(s =>
              s.id === subjectId ? {
                ...s,
                topics: s.topics.map(t => t.id === topicId ? { ...t, dueDate } : t)
              } : s
            )
          } : ms
        ));
      }
    } catch (error) {
      console.error('Error updating topic due date:', error);
    }
  };

  const reorderMainSubjects = async (reorderedMainSubjects: MainSubject[]) => {
    setMainSubjects(reorderedMainSubjects);
    try {
      const response = await fetch('/api/todo/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'mainSubject', items: reorderedMainSubjects }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to persist reorder:', errorData);
        alert(`Error reordering main subjects: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to persist reorder:', error);
      alert('Failed to connect to server when reordering main subjects.');
    }
  };

  const reorderSubjects = async (mainSubjectId: string, reorderedSubjects: Subject[]) => {
    setMainSubjects(prev =>
      prev.map(ms => ms.id === mainSubjectId ? { ...ms, subjects: reorderedSubjects } : ms)
    );
    try {
      const response = await fetch('/api/todo/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subject', items: reorderedSubjects }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to persist reorder:', errorData);
        alert(`Error reordering subjects: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to persist reorder:', error);
      alert('Failed to connect to server when reordering subjects.');
    }
  };

  const reorderTopics = async (mainSubjectId: string, subjectId: string, reorderedTopics: Topic[]) => {
    setMainSubjects(prev => prev.map(ms =>
      ms.id === mainSubjectId ? {
        ...ms,
        subjects: ms.subjects.map(s =>
          s.id === subjectId ? { ...s, topics: reorderedTopics } : s
        )
      } : ms
    ));
    try {
      const response = await fetch('/api/todo/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'topic', items: reorderedTopics }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to persist reorder:', errorData);
        alert(`Error reordering topics: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to persist reorder:', error);
      alert('Failed to connect to server when reordering topics.');
    }
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDayColor = (date: Date): string | null => {
    return dayColors.get(getDateKey(date)) || null;
  };

  const setDayColor = async (date: Date, color: string) => {
    if (!currentUser) return;
    const key = getDateKey(date);

    // Update local state optimistically
    setDayColors(prev => {
      const newMap = new Map(prev);
      newMap.set(key, color);
      return newMap;
    });

    try {
      await fetch('/api/calendar/day-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, date: date.toISOString(), color }),
      });
    } catch (error) {
      console.error('Error setting day color on server:', error);
    }
  };

  const removeDayColor = async (date: Date) => {
    if (!currentUser) return;
    const key = getDateKey(date);

    // Update local state optimistically
    setDayColors(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });

    try {
      await fetch('/api/calendar/day-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, date: date.toISOString(), color: null }),
      });
    } catch (error) {
      console.error('Error removing day color on server:', error);
    }
  };

  const addCalendarTask = async (title: string, dueDate: number, color?: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, title, date: new Date(dueDate).toISOString() }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setCalendarTasks(prev => [...prev, { ...newTask, dueDate: new Date(newTask.date).getTime() }]);
      }
    } catch (error) {
      console.error('Error adding calendar task:', error);
    }
  };

  const updateCalendarTask = async (id: string, title: string, color?: string) => {
    try {
      const response = await fetch(`/api/calendar/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        const updated = await response.json();
        setCalendarTasks(prev =>
          prev.map(task =>
            task.id === id ? { ...task, ...updated, dueDate: new Date(updated.date).getTime() } : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating calendar task:', error);
    }
  };

  const deleteCalendarTask = async (id: string) => {
    try {
      const response = await fetch(`/api/calendar/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCalendarTasks(prev => prev.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting calendar task:', error);
    }
  };

  const toggleCalendarTask = async (id: string) => {
    const task = calendarTasks.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;

    // Optimistic update
    setCalendarTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t)
    );

    try {
      const response = await fetch(`/api/calendar/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (!response.ok) {
        // Revert on failure
        setCalendarTasks(prev =>
          prev.map(t => t.id === id ? { ...t, completed: !newCompleted } : t)
        );
      }
    } catch (error) {
      console.error('Error toggling calendar task:', error);
      setCalendarTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !newCompleted } : t)
      );
    }
  };

  // Create a merged version of mainSubjects that includes user completion status
  // This ensures all consumers perceive the mainSubjects as having the correct state
  const mergedMainSubjects = React.useMemo(() => {
    return mainSubjects.map(ms => ({
      ...ms,
      subjects: ms.subjects.map(s => ({
        ...s,
        topics: s.topics.map(t => ({
          ...t,
          completed: isTopicCompleted(t.id)
        }))
      }))
    }));
  }, [mainSubjects, userCompletions]);

  const value: TodoContextType = {
    mainSubjects: mergedMainSubjects,
    isLoading,
    addMainSubject,
    updateMainSubject,
    deleteMainSubject,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopic,
    getSubjectProgress,
    getMainSubjectProgress,
    getTotalProgress,
    getTasksByDateRange,
    updateTopicDueDate,
    reorderMainSubjects,
    reorderSubjects,
    reorderTopics,
    dayColors,
    getDayColor,
    setDayColor,
    removeDayColor,
    calendarTasks,
    addCalendarTask,
    updateCalendarTask,
    deleteCalendarTask,
    toggleCalendarTask,
    isTopicCompleted,
    refreshData,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
