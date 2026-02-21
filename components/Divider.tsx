import React from "react";

interface DividerProps {
  text?: string;
  className?: string;
}

export default function Divider({ text = "ឬ", className = "" }: DividerProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-1 border-t border-slate-200"></div>
      <span className="px-4 text-sm text-slate-500">{text}</span>
      <div className="flex-1 border-t border-slate-200"></div>
    </div>
  );
}

