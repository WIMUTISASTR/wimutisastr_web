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
        className={`w-full px-4 py-3 border rounded-lg transition-colors outline-none ${
          hasError
            ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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

