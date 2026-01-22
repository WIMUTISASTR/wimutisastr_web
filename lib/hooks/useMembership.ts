"use client";

import { useEffect, useState } from "react";
import { fetchMembershipStatus } from "@/lib/api/client";

export function useMembership() {
  const [status, setStatus] = useState<"pending" | "approved" | "denied" | "none">("none");
  const [membershipEndsAt, setMembershipEndsAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMembershipStatus();
        if (!cancelled) {
          setStatus(data.status);
          setMembershipEndsAt(data.membershipEndsAt);
        }
      } catch {
        if (!cancelled) {
          setStatus("none");
          setMembershipEndsAt(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, membershipEndsAt, isLoading };
}
