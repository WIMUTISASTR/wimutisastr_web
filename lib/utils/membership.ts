export type MembershipStatus = "pending" | "approved" | "denied" | "none";

/** True when the user has an approved membership that has not expired. */
export function isActiveApprovedMembership(
  status: MembershipStatus,
  membershipEndsAt: string | null
): boolean {
  if (status !== "approved") return false;
  if (!membershipEndsAt) return true;
  const end = new Date(membershipEndsAt);
  return !Number.isNaN(end.getTime()) && end.getTime() > Date.now();
}

export function formatMembershipDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
