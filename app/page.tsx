"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Note, User } from "@/lib/data";
import { fetchNotes, fetchLeaderboard } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import HomeView from "@/components/HomeView";
import ReadingMode from "@/components/ReadingMode";
import LibraryView from "@/components/LibraryView";
import SocialView from "@/components/SocialView";
import LoginModal from "@/components/LoginModal";

type ViewState = "home" | "library" | "social";

export default function Home() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [viewState, setViewState] = useState<ViewState>("home");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [notesData, usersData] = await Promise.all([
        fetchNotes(),
        fetchLeaderboard(),
      ]);
      setNotes(notesData);
      setUsers(usersData);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  const handleSaveNote = (note: Note) => {
    if (!savedNotes.find((n) => n.id === note.id)) {
      setSavedNotes((prev) => [note, ...prev]);
    }
  };

  // Use authenticated user's profile or fallback to guest
  const currentUser = profile ? {
    id: profile.id,
    name: profile.username || "User",
    avatar: profile.avatar_url || "https://i.pravatar.cc/150?u=guest",
    earnings: 0,
    notesPosted: 0,
    totalUpvotes: profile.total_score || 0,
  } : users[0] || {
    id: "1",
    name: "Guest",
    avatar: "https://i.pravatar.cc/150?u=guest",
    earnings: 0,
    notesPosted: 0,
    totalUpvotes: 0,
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    const { y } = info.offset;

    if (viewState === "home") {
      if (y < -threshold) {
        setViewState("library");
      } else if (y > threshold) {
        setViewState("social");
      }
    } else if (viewState === "library") {
      if (y > threshold) {
        setViewState("home");
      }
    } else if (viewState === "social") {
      if (y < -threshold) {
        setViewState("home");
      }
    }
  };

  if (isLoading) {
    return (
      <main className="fixed inset-0 overflow-hidden bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-background text-foreground">
      {/* Main Container for Diamond Navigation */}
      <motion.div
        className="w-full h-full relative"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence initial={false} custom={viewState}>
          {/* Library View (Top) */}
          {viewState === "library" && (
            <motion.div
              key="library"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-background"
            >
              <LibraryView 
                savedNotes={savedNotes} 
                onNoteClick={(note) => setActiveNote(note)} 
              />
            </motion.div>
          )}

          {/* Home View (Center) */}
          <motion.div
            key="home"
            className="absolute inset-0 z-10"
            animate={{
              scale: viewState === "home" ? 1 : 0.9,
              opacity: viewState === "home" ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          >
            <HomeView 
              notes={notes} 
              onNoteClick={(note) => setActiveNote(note)} 
              onSave={handleSaveNote}
            />
            
            {/* Navigation Hints */}
            {viewState === "home" && (
                <>
                    <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none opacity-50">
                        <span className="text-xs uppercase tracking-widest">Library</span>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none opacity-50">
                        <span className="text-xs uppercase tracking-widest">Social</span>
                    </div>
                </>
            )}
          </motion.div>

          {/* Social View (Bottom) */}
          {viewState === "social" && (
            <motion.div
              key="social"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-background"
            >
              <SocialView users={users} currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reading Mode Overlay */}
      <AnimatePresence>
        {activeNote && (
          <ReadingMode 
            note={activeNote} 
            onClose={() => setActiveNote(null)} 
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal 
        isOpen={!authLoading && !user} 
        onClose={() => {}} 
      />
    </main>
  );
}
