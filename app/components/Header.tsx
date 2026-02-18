import React from 'react'
import Logo from './icons/Logo';
import Close from './icons/Close';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
    onLogoClick?: () => void;
}


function Header({ setSidebarOpen, onLogoClick }: HeaderProps) {
    return (
        <header className="flex items-center justify-between border-b border-white/10 p-4  md:hidden">
            <button onClick={onLogoClick} className="cursor-pointer">
                <Logo />
            </button>
            <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-1 text-zinc-500  hover:bg-white/6 hover:text-zinc-300 rotate-180"
            >
                <Close />
            </button>
        </header>
    )
}

export default Header