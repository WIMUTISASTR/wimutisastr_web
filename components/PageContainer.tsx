import Nav from "./Nav";
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-(--background) text-(--foreground) pt-20 ${className}`}>
      <Nav />
      {children}
    </div>
  );
}

