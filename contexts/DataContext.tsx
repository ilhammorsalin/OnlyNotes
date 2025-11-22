"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, User } from '@/lib/data';
import { fetchNotes, fetchLeaderboard, fetchSavedNotes } from '@/lib/supabase-client';

interface DataContextType {
  notes: Note[];
  users: User[];
  savedNotes: Note[];
  isLoading: boolean;
  refreshNotes: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshSavedNotes: (userId?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshNotes = async () => {
    const data = await fetchNotes();
    setNotes(data);
  };

  const refreshLeaderboard = async () => {
    const data = await fetchLeaderboard();
    setUsers(data);
  };

  const refreshSavedNotes = async (userId?: string) => {
    if (!userId) return;
    const data = await fetchSavedNotes(userId);
    setSavedNotes(data);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshNotes(),
        refreshLeaderboard(),
      ]);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        notes,
        users,
        savedNotes,
        isLoading,
        refreshNotes,
        refreshLeaderboard,
        refreshSavedNotes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
