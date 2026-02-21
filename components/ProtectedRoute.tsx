"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import LoadingState from "@/components/LoadingState";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <LoadingState label="កំពុងផ្ទុក..." />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
