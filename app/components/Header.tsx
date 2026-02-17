import React from 'react'

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}


function Header({ setSidebarOpen }: HeaderProps) {
    return (
        <header className="flex items-center border-b border-zinc-200 p-4 dark:border-zinc-800 md:hidden">
            <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
            <span className="ml-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                URL Summarizer
            </span>
        </header>
    )
}

export default Header