import React from "react";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({ children, className = "" }: FormCardProps) {
  return (
    <div
      className={`bg-[var(--surface-strong)] backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elev-1)] p-8 sm:p-10 border border-[var(--border)] ${className}`}
    >
      {children}
    </div>
  );
}

