"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { dummyNotes, dummyUsers, Note } from "@/lib/data";
import HomeView from "@/components/HomeView";
import ReadingMode from "@/components/ReadingMode";
import LibraryView from "@/components/LibraryView";
import SocialView from "@/components/SocialView";

type ViewState = "home" | "library" | "social";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("home");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  // Mock current user
  const currentUser = dummyUsers[0];

  const handleDragEnd = (_: any, info: PanInfo) => {
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
                savedNotes={dummyNotes} 
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
              notes={dummyNotes} 
              onNoteClick={(note) => setActiveNote(note)} 
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
              <SocialView users={dummyUsers} currentUser={currentUser} />
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
    </main>
  );
}
