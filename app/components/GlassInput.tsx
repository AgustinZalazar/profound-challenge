interface GlassInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function GlassInput({ value, onChange, disabled, placeholder = "https://example.com" }: GlassInputProps) {
    return (
        <div className="glass-bg glass-shadow-input relative flex flex-1 items-center rounded-full px-4 py-3">
            <div className="glass-border pointer-events-none absolute inset-0 rounded-full" />

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 shrink-0 text-white/40"
            >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>

            <input
                type="url"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/30 outline-none disabled:opacity-50"
            />
        </div>
    );
}
