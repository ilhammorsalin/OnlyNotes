"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import AdminControls from "@/components/AdminControls";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Note = {
  id: string;
  title: string;
  hook_summary: string;
  full_content: string;
  created_at: string;
  author_id: string;
  course_id: string;
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

interface NotesDashboardClientProps {
  user: User;
  profile: Profile;
  initialMyNotes: Note[];
  initialGlobalNotes: Note[];
  isAdmin: boolean;
}

export default function NotesDashboardClient({
  user,
  profile,
  initialMyNotes,
  initialGlobalNotes,
  isAdmin,
}: NotesDashboardClientProps) {
  const router = useRouter();
  const [myNotes, setMyNotes] = useState(initialMyNotes);
  const [globalNotes, setGlobalNotes] = useState(initialGlobalNotes);
  const [activeTab, setActiveTab] = useState<"my-notes" | "global-notes">("my-notes");

  const handleNoteDeleted = (noteId: string) => {
    setMyNotes((prev) => prev.filter((note) => note.id !== noteId));
    setGlobalNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const renderNoteCard = (note: Note, showAdminControls: boolean = false) => (
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
          {showAdminControls && (
            <AdminControls
              noteId={note.id}
              noteAuthorId={note.author_id}
              currentUserId={user.id}
              isAdmin={isAdmin}
              onDeleted={() => handleNoteDeleted(note.id)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {note.hook_summary}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(note.created_at).toLocaleDateString()}</span>
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
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notes Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.username}!
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Tabs for My Notes and Global Notes (admin only) */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "my-notes" | "global-notes")}>
            <TabsList className="mb-6">
              <TabsTrigger value="my-notes">My Notes</TabsTrigger>
              <TabsTrigger value="global-notes">Global Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="my-notes" className="space-y-4">
              {myNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      You haven&apos;t created any notes yet.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/create")}
                    >
                      Create Your First Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myNotes.map((note) => renderNoteCard(note, false))
              )}
            </TabsContent>

            <TabsContent value="global-notes" className="space-y-4">
              {globalNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No notes found.</p>
                  </CardContent>
                </Card>
              ) : (
                globalNotes.map((note) => renderNoteCard(note, true))
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">My Notes</h2>
            {myNotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    You haven&apos;t created any notes yet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/create")}
                  >
                    Create Your First Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myNotes.map((note) => renderNoteCard(note, false))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
