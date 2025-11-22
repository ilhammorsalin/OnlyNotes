"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Note } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown } from "lucide-react";

interface LibraryViewProps {
  savedNotes: Note[];
  onNoteClick: (note: Note) => void;
}

export default function LibraryView({ savedNotes, onNoteClick }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = savedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-background flex flex-col pt-12 px-4 pb-4">
      {/* Header & Search */}
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-9 bg-muted/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Masonry Grid (Simulated with CSS columns) */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredNotes.length > 0 ? (
          <div className="columns-2 gap-4 space-y-4">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid"
                onClick={() => onNoteClick(note)}
              >
                <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <Badge variant="secondary" className="w-fit mb-2 text-[10px]">
                      {note.topic}
                    </Badge>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {note.hook}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p>No notes found.</p>
          </div>
        )}
      </div>

      {/* Back to Home Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium uppercase tracking-widest">Swipe Down for Home</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
