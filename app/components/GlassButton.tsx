interface GlassButtonProps {
    disabled?: boolean;
    children?: React.ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    icon?: React.ReactNode;
    color?: string;
}

export default function GlassButton({
    disabled,
    children,
    type = "button",
    onClick,
    icon,
    color = "rgba(134,86,161,1)",
}: GlassButtonProps) {
    const iconOnly = icon && !children;

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`relative shrink-0 rounded-full text-sm font-medium transition-all duration-200 ${
                iconOnly
                    ? "flex items-center justify-center p-3"
                    : icon
                      ? "flex items-center gap-2 px-5 py-3"
                      : "px-6 py-3"
            } ${
                disabled
                    ? "glass-bg glass-shadow-btn-disabled text-white/30"
                    : "glass-shadow-btn-enabled text-white/90 backdrop-blur-[36px]"
            }`}
            style={
                disabled
                    ? undefined
                    : {
                          background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.3) 100%), ${color}`,
                      }
            }
        >
            <div
                className={`pointer-events-none absolute inset-0 rounded-full ${
                    disabled ? "glass-border-soft" : "glass-border-medium"
                }`}
            />
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
}
