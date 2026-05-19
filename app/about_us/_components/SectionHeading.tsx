interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  dark?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  className = "",
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto max-w-3xl text-center scroll-animate ${className}`}>
      {eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-(--accent-light)" : "text-(--primary)"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-(--ink)"}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-white/85" : "text-(--gray-700)"}`}>
          {description}
        </p>
      )}
      <div
        className={`mx-auto mt-6 h-1 w-14 rounded-full ${dark ? "bg-(--accent-light)" : "bg-(--primary)"}`}
        aria-hidden
      />
    </div>
  );
}
