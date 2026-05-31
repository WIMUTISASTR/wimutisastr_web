import type { ReactNode } from "react";
import type { SocialLink, SocialPlatform } from "@/lib/seo/site";

const ICONS: Record<SocialPlatform, ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M22 12.07C22 6.477 17.523 2 11.93 2 6.477 2 2 6.477 2 12.07c0 5.05 3.657 9.236 8.438 9.93v-7.024H7.898v-2.906h2.54V9.854c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.772-1.63 1.562v1.878h2.773l-.443 2.906h-2.33V22c4.78-.694 8.437-4.88 8.437-9.93z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M9.417 15.181 9.3 18.5c.364 0 .522-.157.711-.346l1.707-1.633 3.54 2.592c.649.357 1.11.17 1.287-.595l2.322-10.9h.001c.207-.966-.35-1.344-1-1.11L3.9 10.2c-.934.364-.92.887-.159 1.12l4.77 1.488 11.08-6.98c.521-.315.997-.14.606.175" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M21.582 7.186a2.506 2.506 0 0 0-1.764-1.774C18.254 5 12 5 12 5s-6.254 0-7.818.412A2.506 2.506 0 0 0 2.418 7.186 26.08 26.08 0 0 0 2 12a26.08 26.08 0 0 0 .418 4.814 2.506 2.506 0 0 0 1.764 1.774C5.746 19 12 19 12 19s6.254 0 7.818-.412a2.506 2.506 0 0 0 1.764-1.774A26.08 26.08 0 0 0 22 12a26.08 26.08 0 0 0-.418-4.814zM10 15.464V8.536L16 12l-6 3.464z" />
    </svg>
  ),
};

type SocialLinksProps = {
  links: SocialLink[];
  variant?: "light" | "dark";
  className?: string;
};

function SocialLinkItem({ link, variant }: { link: SocialLink; variant: "light" | "dark" }) {
  const activeClass =
    variant === "light"
      ? "text-white/90 hover:text-white"
      : "text-(--primary) hover:text-(--primary-dark)";

  const inactiveClass = variant === "light" ? "text-white/35" : "text-(--gray-700)/35";

  const content = (
    <>
      {ICONS[link.platform]}
      <span>{link.label}</span>
    </>
  );

  if (!link.href) {
    return (
      <span className={`inline-flex items-center gap-2 text-base font-medium ${inactiveClass}`} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      className={`inline-flex items-center gap-2 text-base font-medium transition-colors duration-200 cursor-pointer ${activeClass}`}
    >
      {content}
    </a>
  );
}

export default function SocialLinks({ links, variant = "dark", className = "" }: SocialLinksProps) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {links.map((link) => (
        <li key={link.platform}>
          <SocialLinkItem link={link} variant={variant} />
        </li>
      ))}
    </ul>
  );
}
