import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Session } from "@/lib/db/schema";

interface SummaryDisplayProps {
    selectedSession: Session | null;
    displayedSummary: string;
    handleDeleteSession: (sessionId: string) => void;
}

function SummaryDisplay({ selectedSession, displayedSummary, handleDeleteSession }: SummaryDisplayProps) {
    return <div className="mt-6 w-full max-w-xl">
        {selectedSession && (
            <div className="mb-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] font-semibold leading-8 text-white">
                        {selectedSession.title || "Untitled"}
                    </h2>
                </div>
            </div>
        )}
        <div className="rounded-lg text-[14px] leading-relaxed text-white/80">
            {displayedSummary ? (
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => (
                            <h1 className="mb-3 mt-6 first:mt-0 text-[24px] font-semibold leading-tight text-white">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="mb-2 mt-5 first:mt-0 text-[24px] font-semibold leading-tight text-white">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="mb-2 mt-4 first:mt-0 text-[18px] font-semibold leading-snug text-white">
                                {children}
                            </h3>
                        ),
                        p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                            <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
                        ),
                        li: ({ children }) => (
                            <li>{children}</li>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-semibold text-white">{children}</strong>
                        ),
                        a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">
                                {children}
                            </a>
                        ),
                    }}
                >
                    {displayedSummary}
                </ReactMarkdown>
            ) : (
                <span className="text-zinc-400 dark:text-zinc-500">
                    Generating summary...
                </span>
            )}
        </div>
    </div>
}

export default SummaryDisplay
