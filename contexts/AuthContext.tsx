'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  password?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => User[];
  deleteUser: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const CURRENT_USER_KEY = 'surgery-course-current-user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from session and fetch users if admin
  useEffect(() => {
    const init = async () => {
      // Check for current user session
      const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedCurrentUser) {
        try {
          const user = JSON.parse(storedCurrentUser);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error loading current user:', error);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }

      // Fetch users from DB if admin
      try {
        const response = await fetch('/api/auth/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Refresh users list
        const usersRes = await fetch('/api/auth/users');
        if (usersRes.ok) setUsers(await usersRes.json());
        return { success: true };
      }

      const errorData = await response.json();
      const errorMessage = errorData.details
        ? `${errorData.error}: ${errorData.details}`
        : (errorData.error || 'Invalid username or password');
      return { success: false, error: errorMessage };
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Refresh users list
        const usersRes = await fetch('/api/auth/users');
        if (usersRes.ok) setUsers(await usersRes.json());
        return { success: true };
      }

      const errorData = await response.json();
      const errorMessage = errorData.details
        ? `${errorData.error}: ${errorData.details}`
        : (errorData.error || 'Registration failed');
      return { success: false, error: errorMessage };
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  const getAllUsers = (): User[] => {
    return users;
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        if (currentUser?.id === userId) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetUserPassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password: newPassword }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };


  const value: AuthContextType = {
    currentUser,
    users,
    isLoading,
    isAdmin: currentUser?.isAdmin || false,
    login,
    logout,
    register,
    getAllUsers,
    deleteUser,
    resetUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
