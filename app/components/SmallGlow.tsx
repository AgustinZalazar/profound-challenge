import React from 'react'

function SmallGlow() {
    return <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-70 blur-[60px]">
        <div className="absolute h-54 w-48 -rotate-[18.74deg] rounded-full bg-[rgba(93,0,255,0.25)]" style={{ top: '10%', right: '0%' }} />
        <div className="absolute h-54 w-42 rotate-[30.1deg] rounded-full bg-[rgba(203,114,255,0.4)]" style={{ top: '0%', right: '-15%' }} />
        <div className="absolute h-54 w-71 rounded-full bg-[rgba(203,114,255,0.4)]" style={{ top: '20%', left: '0%' }} />
    </div>
}

export default SmallGlow