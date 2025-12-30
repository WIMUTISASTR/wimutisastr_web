import Nav from "./Nav";
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-linear-to-b from-slate-50 to-white ${className}`}>
      <Nav />
      {children}
    </div>
  );
}

