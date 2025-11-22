"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, PanInfo } from "framer-motion";
import { Note } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Lock, Unlock, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingModeProps {
  note: Note;
  onClose: () => void;
}

export default function ReadingMode({ note, onClose }: ReadingModeProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  
  // Unlock threshold
  const unlockThreshold = 200;

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      if (!isUnlocked && latest > unlockThreshold) {
        setIsUnlocked(true);
      }
    });
    return () => unsubscribe();
  }, [scrollY, isUnlocked]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 cursor-grab active:cursor-grabbing">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <span className="font-semibold text-sm truncate max-w-[200px]">
          {note.title}
        </span>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto relative"
      >
        <div className="max-w-2xl mx-auto p-6 pb-32">
          {/* Note Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              {note.topic}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={note.author.avatar} />
                <AvatarFallback>{note.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{note.author.name}</p>
                <p className="text-xs text-muted-foreground">Posted 2h ago</p>
              </div>
            </div>
          </div>

          {/* Note Content */}
          <div className="prose dark:prose-invert max-w-none relative">
            <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
              {note.content}
            </div>
            
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isUnlocked ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "absolute inset-0 z-10 pointer-events-none",
                "bg-gradient-to-b from-transparent via-background/80 to-background",
                !isUnlocked && "backdrop-blur-sm"
              )}
              style={{
                top: "30%", // Start blur after 30%
              }}
            >
              {!isUnlocked && (
                <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center justify-center text-center p-4">
                  <Lock className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">
                    Scroll to unlock full content
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast Notification for Unlock */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: isUnlocked ? 0 : 100, opacity: isUnlocked ? 1 : 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
          <Unlock className="h-5 w-5" />
          <span className="font-medium">Unlocked & Upvoted!</span>
          <ThumbsUp className="h-4 w-4 ml-2" />
        </div>
      </motion.div>
    </motion.div>
  );
}
