"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen, Search } from "lucide-react";

type SavedNote = {
  id: string;
  title: string;
  hook_summary: string;
  full_content: string;
  created_at: string;
  author_id: string;
  course_id: string;
  savedAt: string;
  courses: {
    id: string;
    code: string;
    name: string;
  } | null;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

interface SavedNotesClientProps {
  savedNotes: SavedNote[];
}

export default function SavedNotesClient({ savedNotes }: SavedNotesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = savedNotes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.hook_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.profiles?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.courses?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Saved Notes</h1>
            <p className="text-muted-foreground">
              Your collection of saved notes
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved notes..."
              className="pl-9 bg-muted/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No notes match your search."
                    : "You haven't saved any notes yet. Swipe right on notes to save them!"}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/")}
                  >
                    Discover Notes
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{note.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <span>by {note.profiles?.username || "Unknown"}</span>
                        {note.courses && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {note.courses.code}
                            </Badge>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {note.hook_summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Saved {new Date(note.savedAt).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/notes/${note.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
