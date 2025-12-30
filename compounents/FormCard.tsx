import React from "react";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({ children, className = "" }: FormCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

