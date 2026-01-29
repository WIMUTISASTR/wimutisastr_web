import React from "react";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({ children, className = "" }: FormCardProps) {
  return (
    <div
      className={`bg-(--surface-strong) backdrop-blur-xl rounded-2xl shadow-(--shadow-elev-1) p-8 sm:p-10 border border-(--border) ${className}`}
    >
      {children}
    </div>
  );
}

