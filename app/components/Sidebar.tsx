"use client";

import { useState, useMemo } from "react";
import type { Session } from "@/lib/db/schema";
import Logo from "./icons/Logo";
import Close from "./icons/Close";
import More from "./icons/More";
import GlassButton from "./GlassButton";


interface SidebarProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onLogoClick: () => void;
}

export default function Sidebar({
  sessions,
  onSelectSession,
  selectedSessionId,
  isOpen,
  onClose,
  onLogoClick,
}: SidebarProps) {
  const [filter, setFilter] = useState("");

  const filteredSessions = useMemo(() => {
    if (!filter.trim()) return sessions;
    const q = filter.toLowerCase();
    return sessions.filter(
      (s) =>
        s.url.toLowerCase().includes(q) ||
        s.summary?.toLowerCase().includes(q) ||
        s.title?.toLowerCase().includes(q)
    );
  }, [sessions, filter]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10000 bg-black/80 lg:bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-10000 flex h-full w-72 flex-col border-r transition-transform duration-300 border-zinc-800 bg-black/80 lg:bg-black/30 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b p-4 lg:px-6 border-zinc-800">
          <button onClick={onLogoClick} className="cursor-pointer" aria-label="Go to home">
            <Logo />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-white/6 hover:text-zinc-300"
            aria-label="Close sidebar"
          >
            <Close />
          </button>
        </div>

        {sessions.length > 5 && (
          <div className="p-3">
            <div className="glass-bg glass-shadow-input relative flex items-center rounded-full px-4 py-3">
              <div className="glass-border pointer-events-none absolute inset-0 rounded-full" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 shrink-0 text-white/40"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Filter sessions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/30 outline-none"
              />
            </div>
          </div>
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No sessions yet
            </p>
          ) : filteredSessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No matching sessions
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredSessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => {
                      onSelectSession(session);
                      if (!window.matchMedia("(min-width: 768px)").matches) onClose();
                    }}
                    className={`w-full px-6 py-4 text-left flex items-center justify-between transition-colors ${selectedSessionId === session.id
                      ? "bg-white/10"
                      : "hover:bg-white/6"
                      }`}
                  >
                    <p className="truncate text-[13px] leading-4  max-w-[180px] font-regular text-white ">
                      {session.url}
                    </p>
                    <More />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedSessionId && (
          <div className="p-6 w-full">
            <GlassButton type="button" variant="default" className="w-full" onClick={onLogoClick}>New summary</GlassButton>
          </div>
        )}
      </aside>
    </>
  );
}
