import { useState, useCallback } from "react";
import type { Session } from "@/lib/db/schema";
import { sessionSchema, apiErrorSchema } from "@/lib/validators";

interface UseStreamingSummaryOptions {
  onComplete: () => Promise<void>;
}

export function useStreamingSummary({ onComplete }: UseStreamingSummaryOptions) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitUrl = useCallback(async (url: string): Promise<boolean> => {
    if (!url.trim() || isLoading) return false;

    // Client-side URL validation
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setError(`Invalid URL: "${url.trim()}" is not a valid web address. Use a full URL like https://example.com`);
      return false;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      setError(`Invalid protocol: "${parsed.protocol}" is not supported. Only http and https URLs are allowed.`);
      return false;
    }

    if (!parsed.hostname.includes(".")) {
      setError(`Invalid URL: "${parsed.hostname}" doesn't look like a valid domain. Make sure to include the full domain (e.g. example.com).`);
      return false;
    }

    setIsLoading(true);
    setError(null);
    setStreamedText("");
    setSelectedSession(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        const parsed = apiErrorSchema.safeParse(data);
        throw new Error(parsed.success ? parsed.data.error : "Failed to create summary");
      }

      const sessionId = res.headers.get("X-Session-Id");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedText(fullText);
      }

      await onComplete();

      if (sessionId) {
        const sessionRes = await fetch(`/api/sessions/${sessionId}`);
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          const parsed = sessionSchema.safeParse(data);
          if (parsed.success) {
            setSelectedSession(parsed.data);
          }
        }
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onComplete]);

  const selectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    setStreamedText("");
    setError(null);
  }, []);

  const clearView = useCallback(() => {
    setSelectedSession(null);
    setStreamedText("");
    setError(null);
  }, []);

  const handleDelete = useCallback(async (sessionId: string, deleteFn: (id: string) => Promise<boolean>) => {
    const success = await deleteFn(sessionId);
    if (success && selectedSession?.id === sessionId) {
      setSelectedSession(null);
      setStreamedText("");
    }
  }, [selectedSession?.id]);

  const displayedSummary = selectedSession?.summary || streamedText;

  const clearError = useCallback(() => setError(null), []);

  return {
    selectedSession,
    streamedText,
    isLoading,
    error,
    displayedSummary,
    submitUrl,
    selectSession,
    clearView,
    clearError,
    handleDelete,
  };
}
