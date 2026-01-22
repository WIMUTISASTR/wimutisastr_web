import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "icon";
  fullWidth?: boolean;
  children: React.ReactNode;
}

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brown)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    // Professional brown primary
    primary:
      "bg-[var(--brown)] text-white ring-[var(--brown)]/25 shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-[var(--brown-strong)]",
    // Charcoal button for serious actions
    secondary:
      "bg-[var(--ink)] text-white ring-[var(--ink)]/10 shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:opacity-90",
    // Paper button
    outline:
      "bg-white/80 backdrop-blur text-[var(--ink)] ring-slate-200 shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-[1px]",
    ghost:
      "bg-transparent text-slate-700 ring-transparent shadow-none hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-sm sm:text-base",
    icon: "p-2",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], widthClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

