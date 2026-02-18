"use client";

import { useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Session } from "@/lib/db/schema";
import GlassButton from './GlassButton';
import Delete from './icons/Delete';
import Copy from './icons/Copy';
import Download from './icons/Download';

interface SummaryDisplayProps {
    selectedSession: Session | null;
    displayedSummary: string;
    handleDeleteSession: (sessionId: string) => void;
}

function SummaryDisplay({ selectedSession, displayedSummary, handleDeleteSession }: SummaryDisplayProps) {
    const footerRef = useRef<HTMLDivElement>(null);
    const [footerVisible, setFooterVisible] = useState(false);

    useEffect(() => {
        if (!footerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => setFooterVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, [displayedSummary]);

    return <div className="mt-6 xl:w-full xl:max-w-xl w z-1000">
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
                <>
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

                    {selectedSession && (
                        <div className={`fixed bottom-6 left-1/2 z-10000 -translate-x-1/2 transition-all duration-300 ease-in-out md:ml-36 ${footerVisible
                            ? "pointer-events-none translate-y-4 opacity-0"
                            : "translate-y-0 opacity-100"
                            }`}>
                            <GlassButton variant="ghost" onClick={() => window.open(selectedSession.url, "_blank")}>
                                <span className="max-w-[280px] truncate">{selectedSession.url}</span>
                            </GlassButton>
                        </div>
                    )}

                    <div ref={footerRef} className="mt-6 flex flex-col md:flex-row gap-2">
                        <GlassButton variant="ghost" onClick={() => window.open(selectedSession?.url, "_blank")}>
                            <span className="max-w-[280px] truncate">{selectedSession?.url}</span>
                        </GlassButton>
                        <div className='flex flex-row gap-2 justify-center'>
                            <GlassButton variant="default" icon={<Copy />} onClick={() => navigator.clipboard.writeText(displayedSummary)} />
                            <GlassButton variant="default" icon={<Download />} onClick={() => { }} />
                            <GlassButton variant="danger" icon={<Delete />} onClick={() => handleDeleteSession(selectedSession?.id || "")} />
                        </div>
                    </div>
                </>
            ) : (
                <span className="text-white">
                    Generating summary...
                </span>
            )}
        </div>
    </div>
}

export default SummaryDisplay
