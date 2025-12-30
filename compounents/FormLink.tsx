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
      className={`text-amber-600 hover:text-amber-700 font-semibold ${className}`}
    >
      {children}
    </Link>
  );
}

