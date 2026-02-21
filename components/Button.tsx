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
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-(--primary) text-white border border-transparent shadow-sm hover:bg-(--primary-light) active:bg-(--primary-dark)",
    secondary:
      "bg-(--ink) text-white border border-transparent shadow-sm hover:bg-(--gray-700) active:bg-(--gray-900)",
    outline:
      "bg-white text-(--ink) border border-(--gray-300) shadow-sm hover:border-(--primary) hover:text-(--primary) hover:bg-(--gray-50)",
    ghost:
      "bg-transparent text-(--gray-700) border border-transparent hover:bg-(--gray-100) hover:text-(--ink)",
    gradient:
      "bg-(--accent-dark) text-white border border-transparent shadow-sm hover:bg-(--accent)",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
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

