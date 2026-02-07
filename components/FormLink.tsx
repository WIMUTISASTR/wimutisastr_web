import Link from "next/link";
import React from "react";

interface FormLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormLink({ href, children, className = "" }: FormLinkProps) {
  return (
    <Link
      href={href}
      className={`text-[var(--brown-strong)] hover:text-[var(--brown)] font-semibold underline-offset-4 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}

