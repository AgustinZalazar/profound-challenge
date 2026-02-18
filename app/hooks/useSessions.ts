import { useState, useEffect, useCallback } from "react";
import type { Session } from "@/lib/db/schema";
import { sessionsListSchema } from "@/lib/validators";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = useCallback(async (query = "") => {
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/sessions${params}`);
      if (res.ok) {
        const data = await res.json();
        const parsed = sessionsListSchema.safeParse(data);
        if (parsed.success) {
          setSessions(parsed.data);
        } else {
          console.error("Invalid sessions response:", parsed.error);
        }
      }
    } catch {
      console.error("Failed to fetch sessions");
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchSessions();
    }
    return res.ok;
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, fetchSessions, deleteSession };
}
