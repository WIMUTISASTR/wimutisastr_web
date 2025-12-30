import React from "react";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export default function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}

