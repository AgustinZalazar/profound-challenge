type GlassButtonVariant = "default" | "ghost" | "danger";

interface GlassButtonProps {
    disabled?: boolean;
    children?: React.ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: GlassButtonVariant;
}

const variantClasses: Record<GlassButtonVariant, string> = {
    default: "glass-btn-default glass-shadow-btn-enabled backdrop-blur-[36px] text-white/90",
    ghost: "glass-btn-ghost glass-shadow-input text-white/70",
    danger: "glass-btn-danger glass-shadow-btn-enabled backdrop-blur-[36px] text-white/90",
};

const iconOnlyVariantClasses: Record<GlassButtonVariant, string> = {
    default: "glass-btn-ghost-icon glass-shadow-btn-icon backdrop-blur-[7px] text-white/90",
    ghost: "glass-btn-ghost glass-shadow-input text-white/70",
    danger: "glass-btn-icon-danger glass-shadow-btn-enabled backdrop-blur-[7px] text-white/90",
};

const borderClasses: Record<GlassButtonVariant, string> = {
    default: "glass-border-medium",
    ghost: "glass-border-soft",
    danger: "glass-border-medium",
};

export default function GlassButton({
    disabled,
    children,
    type = "button",
    onClick,
    icon,
    variant = "default",
}: GlassButtonProps) {
    const iconOnly = icon && !children;

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`relative cursor-pointer shrink-0 rounded-full text-sm font-medium transition-all duration-200 ${iconOnly
                ? "flex items-center justify-center p-4"
                : icon
                    ? "flex items-center gap-2 px-5 py-3"
                    : "px-6 py-3"
                } ${disabled
                    ? "glass-bg glass-shadow-btn-disabled text-white/30"
                    : iconOnly
                        ? iconOnlyVariantClasses[variant]
                        : variantClasses[variant]
                }`}
        >
            <div
                className={`pointer-events-none absolute inset-0 rounded-full ${disabled ? "glass-border-soft" : borderClasses[variant]
                    }`}
            />
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
}
