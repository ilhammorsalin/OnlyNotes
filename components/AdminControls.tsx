"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { adminDeleteNote } from "@/lib/actions";

interface AdminControlsProps {
  noteId: string;
  noteAuthorId: string;
  currentUserId: string;
  isAdmin: boolean;
  onDeleted?: () => void;
}

export default function AdminControls({
  noteId,
  noteAuthorId,
  currentUserId,
  isAdmin,
  onDeleted,
}: AdminControlsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Only render if user is admin and viewing someone else's note
  if (!isAdmin || noteAuthorId === currentUserId) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await adminDeleteNote(noteId);

    if (result.error) {
      console.error(`Error deleting note: ${result.error}`);
      setIsDeleting(false);
    } else {
      // Call onDeleted callback if provided
      if (onDeleted) {
        onDeleted();
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete Note"}
      </Button>
    </div>
  );
}
