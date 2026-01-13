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
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
          {rightElement}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-strong)] shadow-sm ring-1 ring-inset transition-colors outline-none placeholder:text-slate-400 ${
          hasError
            ? "ring-red-300 focus:ring-2 focus:ring-red-500"
            : "ring-[var(--border)] focus:ring-2 focus:ring-[var(--brown)]"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

