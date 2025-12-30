import React from "react";

interface DividerProps {
  text?: string;
  className?: string;
}

export default function Divider({ text = "Or", className = "" }: DividerProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="px-4 text-sm text-gray-500">{text}</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
  );
}

