import React from "react";

type LoadingTone = "brand" | "white";
type LoadingSize = "sm" | "md" | "lg";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const dotSizes: Record<LoadingSize, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const labelSizes: Record<LoadingSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const dotTone: Record<LoadingTone, string> = {
  brand: "bg-(--brown)",
  white: "bg-white",
};

const labelTone: Record<LoadingTone, string> = {
  brand: "text-gray-600",
  white: "text-white/90",
};

export default function LoadingState({
  label = "កំពុងផ្ទុក...",
  tone = "brand",
  size = "md",
  className,
}: {
  label?: string;
  tone?: LoadingTone;
  size?: LoadingSize;
  className?: string;
}) {
  const dotBase = cn("rounded-full animate-bounce", dotSizes[size], dotTone[tone]);

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className={cn(dotBase, "[animation-delay:-0.24s]")} />
        <span className={cn(dotBase, "[animation-delay:-0.12s]")} />
        <span className={dotBase} />
      </div>

      {label ? <p className={cn("mt-3 font-medium", labelSizes[size], labelTone[tone])}>{label}</p> : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}

