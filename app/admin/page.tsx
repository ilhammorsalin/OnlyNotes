"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Ban, Users, FileText, ArrowLeft } from "lucide-react";
import { adminDeleteNote } from "@/app/actions/notes";

interface NoteData {
  id: string;
  title: string;
  created_at: string;
  author_id: string;
  profiles: {
    id: string;
    username: string;
    is_banned: boolean;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [myNotes, setMyNotes] = useState<NoteData[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalNotes: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!profile) return;
    
    setIsLoading(true);

    // Fetch all notes with author info
    const { data: notesData } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        created_at,
        author_id,
        profiles (
          id,
          username,
          is_banned
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    // Fetch my notes (notes authored by current user)
    const { data: myNotesData } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        created_at,
        author_id,
        profiles (
          id,
          username,
          is_banned
        )
      `)
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    // Fetch stats
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: noteCount } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true });

    // Transform the data to match NoteData interface
    // Supabase returns profiles as an array, we need to extract the first element
    const transformNotes = (notes: unknown[]): NoteData[] => {
      return notes.map((note: any) => ({
        ...note,
        profiles: Array.isArray(note.profiles) ? note.profiles[0] : note.profiles
      }));
    };

    setNotes(notesData ? transformNotes(notesData) : []);
    setMyNotes(myNotesData ? transformNotes(myNotesData) : []);
    setStats({
      totalUsers: userCount || 0,
      totalNotes: noteCount || 0,
    });
    setIsLoading(false);
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const result = await adminDeleteNote(noteId);
    
    if (result.success) {
      setNotes(notes.filter((n) => n.id !== noteId));
      setMyNotes(myNotes.filter((n) => n.id !== noteId));
      setStats({ ...stats, totalNotes: stats.totalNotes - 1 });
    } else {
      alert(result.error || "Failed to delete note");
    }
  };

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentlyBanned })
      .eq("id", userId);

    if (!error) {
      loadData();
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.is_admin;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users and content
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Notes Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="all">All Notes</TabsTrigger>
                <TabsTrigger value="my">My Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : notes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No notes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        notes.map((note) => (
                          <TableRow key={note.id}>
                            <TableCell className="font-medium">
                              {note.title}
                            </TableCell>
                            <TableCell>
                              {note.profiles?.username || "Unknown"}
                              {note.profiles?.is_banned && (
                                <span className="ml-2 text-xs text-destructive">
                                  (Banned)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(note.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleBanUser(
                                      note.profiles.id,
                                      note.profiles.is_banned
                                    )
                                  }
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  {note.profiles.is_banned ? "Unban" : "Ban"}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="my">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : myNotes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            No notes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        myNotes.map((note) => (
                          <TableRow key={note.id}>
                            <TableCell className="font-medium">
                              {note.title}
                            </TableCell>
                            <TableCell>
                              {new Date(note.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
