"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remark } from "remark";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export default function CreateNote() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [hookSummary, setHookSummary] = useState("");
  const [content, setContent] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    validateMarkdown(content);
  }, [content]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("code");
    setCourses(data || []);
  };

  const validateMarkdown = (text: string) => {
    const errors: string[] = [];

    // Check if empty
    if (!text.trim()) {
      setValidation({ isValid: false, errors: ["Content cannot be empty"] });
      return;
    }

    // Try to parse markdown
    try {
      remark().use(remarkGfm).processSync(text);
    } catch (error) {
      errors.push("Invalid Markdown syntax");
    }

    // Check for at least one header
    const hasHeader = /^#{1,6}\s+.+$/m.test(text);
    if (!hasHeader) {
      errors.push("Note must contain at least one header (#)");
    }

    // Check for at least one list item
    const hasList = /^[\s]*[-*+]\s+.+$/m.test(text) || /^[\s]*\d+\.\s+.+$/m.test(text);
    if (!hasList) {
      errors.push("Note must contain at least one list item (- or 1.)");
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
    });
  };

  const handleSubmit = async () => {
    if (!validation.isValid || !title || !courseId || !hookSummary) {
      return;
    }

    if (hookSummary.length > 140) {
      alert("Hook summary must be 140 characters or less");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("notes").insert({
        author_id: user?.id,
        course_id: courseId,
        title,
        hook_summary: hookSummary,
        full_content: content,
      });

      if (error) throw error;

      router.push("/");
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to create notes.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Note</h1>
              <p className="text-sm text-muted-foreground">
                Share your knowledge with the community
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!validation.isValid || !title || !courseId || !hookSummary || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Note"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 mb-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Big O Notation Explained"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hook">
              Hook Summary ({hookSummary.length}/140)
            </Label>
            <Input
              id="hook"
              value={hookSummary}
              onChange={(e) => setHookSummary(e.target.value)}
              placeholder="A catchy one-liner to grab attention"
              maxLength={140}
            />
          </div>
        </div>

        {/* Split Screen Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content (Markdown)</Label>
              {validation.isValid ? (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {validation.errors.length} error(s)
                </div>
              )}
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Your Note Title&#10;&#10;Write your note content here using Markdown...&#10;&#10;- Use lists&#10;- Add headers&#10;- Format text"
              className="min-h-[600px] font-mono text-sm"
            />
            {validation.errors.length > 0 && (
              <Card className="p-4 bg-destructive/10 border-destructive/20">
                <p className="text-sm font-semibold text-destructive mb-2">
                  Compilation Failed:
                </p>
                <ul className="text-sm text-destructive space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Live Preview</Label>
            <Card className="p-6 min-h-[600px] overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || "*Preview will appear here...*"}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
