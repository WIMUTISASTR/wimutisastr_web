import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
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
    "relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-none";

  const variants = {
    primary:
      "bg-(--primary) text-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] hover:bg-[var(--primary-light)] active:scale-[0.98] transition-all duration-300",
    secondary:
      "bg-[var(--ink)] text-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] hover:bg-[var(--gray-700)] active:scale-[0.98] transition-all duration-300",
    outline:
      "bg-white/90 backdrop-blur-sm text-[var(--ink)] border-2 border-[var(--gray-200)] shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[var(--primary)] hover:text-(--primary) active:scale-[0.98] transition-all duration-300",
    ghost:
      "bg-transparent text-(--gray-700) hover:bg-[var(--gray-100)] hover:text-[var(--ink)] active:scale-[0.98] transition-all duration-300",
    gradient:
      "bg-(--accent) text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:bg-(--accent-dark) active:scale-[0.98] transition-all duration-300",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    icon: "p-2.5",
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

