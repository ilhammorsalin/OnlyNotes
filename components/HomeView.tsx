"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { Note } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Heart, BookOpen } from "lucide-react";

interface HomeViewProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onSave: (note: Note) => void;
}

export default function HomeView({ notes, onNoteClick, onSave }: HomeViewProps) {
  const [visibleNotes, setVisibleNotes] = useState(notes);

  const removeNote = (id: string, direction: "left" | "right") => {
    setVisibleNotes((prev) => prev.filter((note) => note.id !== id));
    if (direction === "right") {
      const note = visibleNotes.find((n) => n.id === id);
      if (note) onSave(note);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {visibleNotes.map((note, index) => {
          const isTop = index === visibleNotes.length - 1;
          return (
            <SwipeableCard
              key={note.id}
              note={note}
              isTop={isTop}
              onSwipe={(dir) => removeNote(note.id, dir)}
              onClick={() => onNoteClick(note)}
              index={index}
              total={visibleNotes.length}
            />
          );
        })}
      </AnimatePresence>
      {visibleNotes.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p>No more notes!</p>
          <p className="text-sm">Check back later.</p>
        </div>
      )}
    </div>
  );
}

interface SwipeableCardProps {
  note: Note;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onClick: () => void;
  index: number;
  total: number;
}

function SwipeableCard({
  note,
  isTop,
  onSwipe,
  onClick,
  index,
  total,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  
  // Background color indicators for swipe
  const bgRight = useTransform(x, [0, 150], ["rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]); // Green for like
  const bgLeft = useTransform(x, [-150, 0], ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)"]); // Red for dislike

  const handleDragEnd = (
    _: unknown,
    info: PanInfo
  ) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: index,
        scale: 1 - (total - 1 - index) * 0.05,
        y: (total - 1 - index) * 10,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1 - (total - 1 - index) * 0.05, opacity: 1, y: (total - 1 - index) * 10 }}
      exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
      className="absolute w-[90%] max-w-md h-[70vh] cursor-grab active:cursor-grabbing"
    >
      <Card className="w-full h-full flex flex-col overflow-hidden border-2 border-border/50 shadow-xl bg-card relative">
        {/* Swipe Indicators Overlay */}
        {isTop && (
            <>
                <motion.div style={{ backgroundColor: bgRight }} className="absolute inset-0 z-20 pointer-events-none rounded-xl" />
                <motion.div style={{ backgroundColor: bgLeft }} className="absolute inset-0 z-20 pointer-events-none rounded-xl" />
            </>
        )}

        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="mb-2 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20">
              {note.topic}
            </Badge>
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                <span>★</span>
                <span>{note.upvotes}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-foreground">{note.title}</h2>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={note.author.avatar} />
              <AvatarFallback>{note.author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
              by {note.author.name}
            </span>
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50 flex-1">
            <p className="text-lg font-medium italic text-foreground/80">
              &quot;{note.hook}&quot;
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 px-6 flex justify-between items-center relative z-10">
            <div className="flex gap-4 w-full justify-center">
                <button 
                    className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors border border-border"
                    onClick={() => onSwipe("left")}
                >
                    <X size={28} />
                </button>
                <button 
                    className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors scale-110"
                    onClick={onClick}
                >
                    <BookOpen size={28} />
                </button>
                <button 
                    className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors border border-border"
                    onClick={() => onSwipe("right")}
                >
                    <Heart size={28} />
                </button>
            </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
