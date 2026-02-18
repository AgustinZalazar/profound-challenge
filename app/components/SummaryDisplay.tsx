"use client";

import { useRef, useState, useEffect, useMemo, isValidElement, cloneElement } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown, { type Components } from 'react-markdown'
import type { Session } from "@/lib/db/schema";
import GlassButton from './GlassButton';
import Delete from './icons/Delete';
import Copy from './icons/Copy';
import Download from './icons/Download';

interface SummaryDisplayProps {
    selectedSession: Session | null;
    displayedSummary: string;
    handleDeleteSession: (sessionId: string) => void;
    sidebarOpen?: boolean;
}

function animateChildren(
    children: React.ReactNode,
    wordCounter: React.MutableRefObject<number>,
    revealedCount: number,
): React.ReactNode {
    return Array.isArray(children)
        ? children.map((child, i) => animateSingle(child, i, wordCounter, revealedCount))
        : animateSingle(children, 0, wordCounter, revealedCount);
}

function animateSingle(
    child: React.ReactNode,
    childIndex: number,
    wordCounter: React.MutableRefObject<number>,
    revealedCount: number,
): React.ReactNode {
    if (typeof child === 'string') {
        return child.split(/(\s+)/).map((segment, i) => {
            if (/^\s+$/.test(segment)) return segment;
            const idx = wordCounter.current++;
            const isNew = idx >= revealedCount;
            return (
                <motion.span
                    key={`${childIndex}-${i}`}
                    initial={isNew ? { opacity: 0, filter: 'blur(8px)' } : false}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                        delay: isNew ? Math.min((idx - revealedCount) * 0.06, 1.2) : 0,
                    }}
                    style={{ display: 'inline-block' }}
                >
                    {segment}
                </motion.span>
            );
        });
    }

    // Recursively process React element children (strong, a, em, etc.)
    // so the word counter stays in reading order
    if (isValidElement(child)) {
        const childProps = child.props as { children?: React.ReactNode };
        if (childProps.children != null) {
            return cloneElement(
                child,
                { key: child.key ?? `el-${childIndex}` },
                animateChildren(childProps.children, wordCounter, revealedCount),
            );
        }
    }

    return child;
}

function SummaryDisplay({ selectedSession, displayedSummary, handleDeleteSession, sidebarOpen }: SummaryDisplayProps) {
    const footerRef = useRef<HTMLDivElement>(null);
    const [footerVisible, setFooterVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const wordCounterRef = useRef(0);
    const revealedWordsRef = useRef(0);
    const wasStreamingRef = useRef(false);

    const isStreaming = !selectedSession && !!displayedSummary;

    // Reset revealed count when a new stream starts
    if (isStreaming && !wasStreamingRef.current) {
        revealedWordsRef.current = 0;
    }
    wasStreamingRef.current = isStreaming;

    // Reset word counter at start of each render pass
    wordCounterRef.current = 0;
    const revealedCount = revealedWordsRef.current;

    // Intentionally no dependency array: must run after every render during streaming
    // to snapshot the current word count, so the next render knows which words are "new".
    // A deps array like [isStreaming] would skip intermediate renders and break the animation.
    useEffect(() => {
        if (isStreaming) {
            revealedWordsRef.current = wordCounterRef.current;
        }
    });

    // Store wrapChildren in a ref so memoized components always use the latest version
    const wrapRef = useRef<(children: React.ReactNode) => React.ReactNode>((c) => c);
    wrapRef.current = (children: React.ReactNode) => {
        if (!isStreaming) return children;
        return animateChildren(children, wordCounterRef, revealedCount);
    };

    // Memoize components so ReactMarkdown doesn't unmount/remount on every chunk
    // Inline elements (strong, a) don't need wrapRef — the parent already handles
    // their text recursively via cloneElement in animateSingle
    const markdownComponents = useMemo<Components>(() => ({
        h1: ({ children }) => (
            <h1 className="mb-3 mt-6 first:mt-0 text-[24px] font-semibold leading-tight text-white">
                {wrapRef.current(children)}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="mb-2 mt-5 first:mt-0 text-[24px] font-semibold leading-tight text-white">
                {wrapRef.current(children)}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="mb-2 mt-4 first:mt-0 text-[18px] font-semibold leading-snug text-white">
                {wrapRef.current(children)}
            </h3>
        ),
        p: ({ children }) => (
            <p className="mb-3 last:mb-0">{wrapRef.current(children)}</p>
        ),
        ul: ({ children }) => (
            <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => (
            <li>{wrapRef.current(children)}</li>
        ),
        strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
        ),
        a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">
                {children}
            </a>
        ),
    }), []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayedSummary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = displayedSummary;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const title = selectedSession?.title || "summary";
        const filename = `${title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-")}.txt`;
        const blob = new Blob([displayedSummary], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
    };

    const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        return () => {
            if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
        };
    }, []);

    const handleDeleteWithFeedback = (sessionId: string) => {
        setDeleted(true);
        deleteTimeoutRef.current = setTimeout(() => {
            setDeleted(false);
            handleDeleteSession(sessionId);
        }, 600);
    };

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
                    <ReactMarkdown components={markdownComponents}>
                        {displayedSummary}
                    </ReactMarkdown>

                    {selectedSession && (
                        <div className={`fixed bottom-6 left-1/2 z-10000 -translate-x-1/2 transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-36" : ""} ${footerVisible
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
                            <GlassButton variant="default" icon={<Copy />} onClick={handleCopy} aria-label="Copy summary">
                                {copied ? "Copied!" : undefined}
                            </GlassButton>
                            <GlassButton variant="default" icon={<Download />} onClick={handleDownload} aria-label="Download summary">
                                {downloaded ? "Downloaded!" : undefined}
                            </GlassButton>
                            <GlassButton variant="danger" icon={<Delete />} onClick={() => handleDeleteWithFeedback(selectedSession?.id || "")} aria-label="Delete session">
                                {deleted ? "Deleted!" : undefined}
                            </GlassButton>
                        </div>
                    </div>
                </>
            ) : (
                <span className="block text-center text-white">
                    Generating summary...
                </span>
            )}
        </div>
    </div>
}

export default SummaryDisplay
