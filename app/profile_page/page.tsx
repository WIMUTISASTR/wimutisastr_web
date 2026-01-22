"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/instance";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useEffect, useMemo, useState } from "react";
import { fetchProfileMe, type ProfileMeResponse } from "@/lib/api/client";

function formatDateTime(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatMonthYear(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [edit, setEdit] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await fetchProfileMe();
        if (cancelled) return;
        setProfile(data);

        const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
        const metaPhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
        const profileName = data.profile?.full_name ?? "";
        setEdit({
          fullName: (metaName || profileName || user.email?.split("@")[0] || "").trim(),
          phone: metaPhone,
        });
      } catch (e) {
        console.error("Failed to load profile:", e);
        toast.error("Failed to load profile data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: edit.fullName, phone: edit.phone },
      });
      if (updateError) {
        toast.error(updateError.message || "Failed to update profile");
        return;
      }
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      try {
        const data = await fetchProfileMe();
        setProfile(data);
      } catch {
        // ignore
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const membershipStatus = profile?.membership.status ?? "none";
  const statusBadge = useMemo(() => {
    if (membershipStatus === "approved") return { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (membershipStatus === "pending") return { label: "Pending review", cls: "bg-amber-50 text-amber-800 border-amber-200" };
    if (membershipStatus === "denied") return { label: "Denied", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    return { label: "No membership", cls: "bg-slate-50 text-slate-700 border-slate-200" };
  }, [membershipStatus]);

  const displayName = useMemo(() => {
    const p = profile?.profile?.full_name ?? "";
    const meta = user && typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
    const email = user?.email ?? profile?.user.email ?? "";
    return (meta || p || email.split("@")[0] || "User").trim();
  }, [profile, user]);

  const displayEmail = user?.email ?? profile?.user.email ?? "";

  const joinDate = useMemo(() => {
    const createdAt = user?.created_at ?? profile?.user.createdAt ?? profile?.profile?.created_at ?? null;
    return formatMonthYear(createdAt);
  }, [profile, user]);

  if (authLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brown)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-[var(--shadow-elev-1)] p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Sign in to view your profile</h1>
            <p className="mt-2 text-sm text-gray-600">Your membership status and payment history are linked to your account.</p>
            <div className="mt-5">
              <Button variant="primary" onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent("/profile_page")}`)}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brown)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="relative bg-slate-900 text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/asset/aboutUs.png" alt="Profile background" fill className="object-cover" priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/65 to-slate-900/75 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brown-soft)] to-transparent z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">My Profile</h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Account details, membership status, and payment history.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <div className="text-center">
                  <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[var(--brown)]/25">
                    <div className="w-full h-full bg-[var(--brown-soft)] flex items-center justify-center">
                      <span className="text-4xl font-bold text-[var(--brown-strong)]">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h2>
                  <p className="text-gray-600">{displayEmail}</p>

                  <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full font-semibold border ${statusBadge.cls}`}>
                    {statusBadge.label}
                  </div>

                  <div className="mt-5 text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Member since</span>
                      <span className="font-semibold text-gray-900">{joinDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Membership ends</span>
                      <span className="font-semibold text-gray-900">
                        {profile?.membership.membershipEndsAt ? formatDateTime(profile.membership.membershipEndsAt) : "—"}
                      </span>
                    </div>
                  </div>

                  {membershipStatus !== "approved" ? (
                    <div className="mt-6">
                      <Button variant="primary" fullWidth onClick={() => router.push("/pricing_page")}>
                        Upgrade membership
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Membership & Payment</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-600">Membership status</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{statusBadge.label}</p>
                    {profile?.membership.notes ? (
                      <p className="mt-2 text-sm text-gray-700">Note: {String(profile.membership.notes)}</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-600">Membership ends</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {profile?.membership.membershipEndsAt ? formatDateTime(profile.membership.membershipEndsAt) : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-semibold text-gray-900">Latest proof of payment</p>
                  {profile?.latestProof ? (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Status</span>
                        <span className="font-semibold text-gray-900">{profile.latestProof.status ?? "—"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Reference</span>
                        <span className="font-semibold text-gray-900">{profile.latestProof.reference ?? "—"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold text-gray-900">{profile.plan?.name ?? profile.latestProof.planId ?? "—"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Uploaded</span>
                        <span className="font-semibold text-gray-900">{formatDateTime(profile.latestProof.uploadedAt)}</span>
                      </div>
                      <div className="flex justify-between gap-3 sm:col-span-2">
                        <span className="text-gray-600">Proof</span>
                        {profile.latestProof.proofUrl ? (
                          <a
                            href={profile.latestProof.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[var(--brown)] hover:underline"
                          >
                            View uploaded image
                          </a>
                        ) : (
                          <span className="font-semibold text-gray-900">—</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">No proof uploaded yet.</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => router.push("/pricing_page")}>
                      View plans
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/payment${profile?.plan?.id ? `?plan=${encodeURIComponent(profile.plan.id)}` : ""}`)}
                    >
                      Go to payment
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="primary" className="px-4 py-2 text-base">
                      Edit
                    </Button>
                  ) : (
                    <div className="space-x-3">
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="px-4 py-2 text-base">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} variant="primary" className="px-4 py-2 text-base" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={edit.fullName}
                        onChange={(e) => setEdit((p) => ({ ...p, fullName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brown)]"
                      />
                    ) : (
                      <p className="text-gray-900">{displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <p className="text-gray-900">{displayEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={edit.phone}
                        onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brown)]"
                      />
                    ) : (
                      <p className="text-gray-900">{edit.phone || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900">{joinDate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">Sign Out</p>
                      <p className="text-sm text-gray-600">Sign out of your account</p>
                    </div>
                    <Button
                      onClick={async () => {
                        await signOut();
                        toast.success("Signed out successfully");
                      }}
                      variant="outline"
                      className="px-4 py-2 text-base"
                    >
                      Sign Out
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brown)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brown)]"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-semibold text-red-600">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently delete your account</p>
                    </div>
                    <Button variant="outline" className="px-4 py-2 text-base border-red-300 text-red-600 hover:bg-red-50">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

