"use client";

import { useState, useEffect } from "react";
import type { Session } from "@/lib/db/schema";
import Logo from "./icons/Logo";
import Close from "./icons/Close";

interface SidebarProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
  onSearch: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  onSelectSession,
  selectedSessionId,
  onSearch,
  isOpen,
  onClose,
}: SidebarProps) {
  // const [searchQuery, setSearchQuery] = useState("");

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //      (searchQuery);
  //   }, 300);
  //   return () => clearTimeout(timeout);
  // }, [searchQuery, onSearch]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r  transition-transform duration-300 border-zinc-800 bg-black/30 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b p-4 lg:px-6 border-zinc-800">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500  hover:bg-zinc-800 hover:text-zinc-300"
          >
            <Close />
          </button>
        </div>

        {/* Search */}
        {/* <div className="p-3">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          />
        </div> */}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
              No sessions yet
            </p>
          ) : (
            <ul className="flex flex-col gap-1 p-2">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${selectedSessionId === session.id
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                  >
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {session.title || session.url}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {session.url}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
