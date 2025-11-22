"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileBadge() {
  const { user, profile } = useAuth();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Use profile from context if available
      if (profile) {
        setRole(profile.is_admin ? 'admin' : 'user');
        setIsLoading(false);
        return;
      }

      // Fallback: fetch from database
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (data) {
        setRole(data.is_admin ? 'admin' : 'user');
      }
      setIsLoading(false);
    };

    fetchRole();
  }, [user, profile]);

  if (isLoading || !role) {
    return null;
  }

  return (
    <Badge
      variant={role === 'admin' ? 'destructive' : 'default'}
      className={role === 'admin' 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-blue-500 hover:bg-blue-600 text-white'
      }
    >
      {role === 'admin' ? 'Admin' : 'User'}
    </Badge>
  );
}
