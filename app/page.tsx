"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Form from "./components/Form";
import SummaryDisplay from "./components/SummaryDisplay";
import SmallGlow from "./components/SmallGlow";
import BigGlow from "./components/BigGlow";
import { useSessions } from "./hooks/useSessions";
import { useStreamingSummary } from "./hooks/useStreamingSummary";
import FadeInUp from "./animations/FadeInUp";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true);
    }
  }, []);
  const [url, setUrl] = useState("");

  const { sessions, isLoadingSessions, fetchSessions, deleteSession } = useSessions();

  const {
    selectedSession,
    isLoading,
    error,
    displayedSummary,
    submitUrl,
    selectSession,
    clearView,
    clearError,
    handleDelete,
  } = useStreamingSummary({ onComplete: fetchSessions });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await submitUrl(url);
    if (success) setUrl("");
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden font-sans bg-zinc-950">
      <Sidebar
        sessions={sessions}
        isLoadingSessions={isLoadingSessions}
        onSelectSession={selectSession}
        selectedSessionId={selectedSession?.id}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogoClick={clearView}
      />

      <div className={`flex flex-1 flex-col transition-[margin] duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}>
        {!sidebarOpen && (
          <Header setSidebarOpen={setSidebarOpen} onLogoClick={clearView} />
        )}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 xl:pt-26">
          {!selectedSession && !displayedSummary && !isLoading && (
            <div className="relative">
              <SmallGlow />
              <div className="relative z-10 w-full max-w-xl text-center">
                <FadeInUp delay={0.2} duration={0.8} yOffset={20} animateOnMount>
                  <h1 className="mb-2 text-2xl font-semibold leading-8 text-white">
                    Let's get to it
                  </h1>
                </FadeInUp>
                <FadeInUp delay={0.4} duration={0.8} yOffset={20} animateOnMount>
                  <p className="mb-10 text-[18px] leading-6 text-[#A0A0A0]">
                    Paste a URL to summarize and understand any content instantly
                  </p>
                </FadeInUp>
              </div>
              <FadeInUp delay={0.6} duration={0.8} yOffset={20} animateOnMount>
                <div className="relative z-10">
                  <Form url={url} setUrl={setUrl} isLoading={isLoading} handleSubmit={handleSubmit} />
                </div>
              </FadeInUp>
            </div>
          )}

          {error && (
            <div className="mt-4 w-full max-w-xl rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400 flex items-start justify-between gap-2">
              <span>{error}</span>
              <button onClick={clearError} className="shrink-0 cursor-pointer text-red-400 hover:text-red-300 transition-colors" aria-label="Dismiss error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {(displayedSummary || isLoading) && (
            <SummaryDisplay
              selectedSession={selectedSession}
              displayedSummary={displayedSummary}
              handleDeleteSession={(id) => handleDelete(id, deleteSession)}
              sidebarOpen={sidebarOpen}
            />
          )}
        </main>
      </div>
      <BigGlow />
    </div>
  );
}
