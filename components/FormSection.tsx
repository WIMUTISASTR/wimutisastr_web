import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
}

export default function FormSection({ 
  children, 
  maxWidth = "md",
  className = "" 
}: FormSectionProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {children}
      </div>
    </section>
  );
}

