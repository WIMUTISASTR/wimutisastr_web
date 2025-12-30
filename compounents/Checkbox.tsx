import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export default function Checkbox({
  label,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const checkboxId = id || props.name || `checkbox-${Math.random()}`;

  return (
    <div className="flex items-start">
      <input
        type="checkbox"
        id={checkboxId}
        className={`mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 ${className}`}
        {...props}
      />
      <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-600">
        {label}
      </label>
    </div>
  );
}

