"use client";

import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import type { Session } from "@/lib/db/schema";
import Header from "./components/Header";
import Form from "./components/Form";
import SummaryDisplay from "./components/SummaryDisplay";
import SmallGlow from "./components/SmallGlow";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (query = "") => {
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/sessions${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      console.error("Failed to fetch sessions");
    }
  }, []);

  // Load sessions on mount
  useState(() => {
    fetchSessions();
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

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
        throw new Error(data.error || "Failed to create summary");
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

      setUrl("");
      await fetchSessions();

      // Select the newly created session
      if (sessionId) {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const session = await res.json();
          setSelectedSession(session);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
          setStreamedText("");
        }
        await fetchSessions();
      }
    } catch {
      console.error("Failed to delete session");
    }
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    setStreamedText("");
    setError(null);
  };

  const displayedSummary = selectedSession?.summary || streamedText;

  return (
    <div className="flex min-h-screen relative overflow-hidden font-sans dark:bg-zinc-950">
      <Sidebar
        sessions={sessions}
        onSelectSession={handleSelectSession}
        selectedSessionId={selectedSession?.id}
        onSearch={fetchSessions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-72">
        {/* Mobile header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Content area */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          {!selectedSession && !streamedText && !isLoading && (
            <div className="relative">
              <SmallGlow />
              <div className="relative z-10 w-full max-w-xl text-center">
                <h1 className="mb-2 text-2xl font-semibold leading-8 dark:text-white">
                  Let's get to it
                </h1>
                <p className="mb-10 text-[18px] leading-6 dark:text-[#A0A0A0]">
                  Paste a URL to summarize and understand any content instantly
                </p>
              </div>
              {/* URL Input */}
              <div className="relative z-10">
                <Form url={url} setUrl={setUrl} isLoading={isLoading} handleSubmit={handleSubmit} />
              </div>
            </div>
          )}


          {/* Error */}
          {error && (
            <div className="mt-4 w-full max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Summary display */}
          {(displayedSummary || isLoading) && (
            <SummaryDisplay selectedSession={selectedSession} displayedSummary={displayedSummary} handleDeleteSession={handleDeleteSession} />
          )}
        </main>
      </div>
      <div className="pointer-events-none absolute -bottom-20 -left-20 z-1000 h-80 w-80 rounded-full bg-[rgba(95,45,124,0.6)] blur-[120px] md:-left-150 md:top-125 md:h-500 md:w-500 lg:-left-276 lg:top-224.5 lg:h-801.25 lg:w-801.25" />
    </div>
  );
}

