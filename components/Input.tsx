import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  rightElement,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || `input-${Math.random()}`;
  const hasError = !!error;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-(--gray-700)"
          >
            {label}
          </label>
          {rightElement}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl bg-(--surface-strong) text-(--ink) shadow-sm ring-1 ring-inset transition-colors outline-none placeholder:text-(--gray-700)/60 ${
          hasError
            ? "ring-red-300 focus:ring-2 focus:ring-red-500"
            : "ring-(--border) focus:ring-2 focus:ring-(--primary)"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-(--gray-700)">{helperText}</p>
      )}
    </div>
  );
}

