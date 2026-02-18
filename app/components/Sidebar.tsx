"use client";

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

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No sessions yet
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {sessions.map((session) => (
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
