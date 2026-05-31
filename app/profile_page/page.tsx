"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils/notify";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/instance";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

function ProfileSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`p-8 sm:p-10 border-b border-(--border) last:border-b-0 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
          {description ? <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-(--border) bg-white/80 px-4 py-3.5">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{value}</dd>
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20";

const readOnlyClassName =
  "rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-900";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [edit, setEdit] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (sessionStorage.getItem("payment_success_notice") === "1") {
      sessionStorage.removeItem("payment_success_notice");
      notify.success("ការទូទាត់ជោគជ័យ! ការជាវរបស់អ្នកបានដំណើរការរួចហើយ។");
    }
  }, []);

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
        notify.error("ផ្ទុកទិន្នន័យប្រវត្តិរូបមិនជោគជ័យ");
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
        notify.error(updateError.message || "ធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបមិនជោគជ័យ");
        return;
      }
      notify.success("បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ!");
      setIsEditing(false);
      try {
        const data = await fetchProfileMe();
        setProfile(data);
      } catch {
        // ignore
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      notify.error("មានកំហុសមិនបានរំពឹងទុក");
    } finally {
      setIsLoading(false);
    }
  };

  const membershipStatus = profile?.membership.status ?? "none";
  const hasPendingPayment = profile?.latestProof?.status === "pending";
  const statusBadge = useMemo(() => {
    if (membershipStatus === "approved") return { label: "បានទទួល", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (membershipStatus === "denied") return { label: "បានបដិសេធ", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    if (membershipStatus === "pending" && hasPendingPayment) {
      return { label: "កំពុងរង់ចាំពិនិត្យ", cls: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    return { label: "មិនទាន់ជាសមាជិក", cls: "bg-slate-50 text-slate-700 border-slate-200" };
  }, [membershipStatus, hasPendingPayment]);

  const displayName = useMemo(() => {
    const p = profile?.profile?.full_name ?? "";
    const meta = user && typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
    const email = user?.email ?? profile?.user.email ?? "";
    return (meta || p || email.split("@")[0] || "អ្នកប្រើប្រាស់").trim();
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
          <LoadingState label="កំពុងផ្ទុក..." />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-elev-1) p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">សូមចូលគណនីដើម្បីមើលប្រវត្តិរូប</h1>
            <p className="mt-2 text-sm text-gray-600">ស្ថានភាពសមាជិក និងប្រវត្តិបង់ប្រាក់របស់អ្នកត្រូវបានភ្ជាប់ជាមួយគណនីនេះ។</p>
            <div className="mt-5">
              <Button variant="primary" onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent("/profile_page")}`)}>
                ចូលគណនី
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
          <LoadingState label="កំពុងផ្ទុកប្រវត្តិរូប..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="relative bg-slate-900 text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/asset/aboutUs.png" alt="Profile background" fill className="object-cover" priority sizes="100vw" fetchPriority="high" />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10" />
        <div className="absolute inset-0 bg-(--brown-soft) opacity-20 z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">ប្រវត្តិរូបរបស់ខ្ញុំ</h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              ព័ត៌មានគណនី ស្ថានភាពសមាជិក និងប្រវត្តិបង់ប្រាក់។
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-(--gray-50)/60">
        <div className="w-full">
          <div className="rounded-2xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-lg) overflow-hidden">
            {/* Profile header */}
            <div className="relative border-b border-(--border) bg-linear-to-br from-slate-50 via-white to-slate-50/80 px-8 sm:px-10 py-8 sm:py-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-(--primary) via-(--accent) to-(--primary-light)" aria-hidden />
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 min-w-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden ring-4 ring-white shadow-md mx-auto sm:mx-0">
                    <div className="w-full h-full bg-linear-to-br from-(--primary)/15 to-(--accent)/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-(--primary-dark)">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">គណនីរបស់អ្នក</p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">{displayName}</h2>
                    <p className="mt-1 text-sm text-slate-600 truncate">{displayEmail}</p>
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.cls}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
                      {statusBadge.label}
                    </div>
                  </div>
                </div>
                {membershipStatus !== "approved" ? (
                  <Button variant="primary" onClick={() => router.push("/pricing_page")} className="shrink-0 w-full lg:w-auto">
                    ចូលជាសមាជិក
                  </Button>
                ) : null}
              </div>
              <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetaStat label="សមាជិកតាំងពី" value={joinDate} />
                <MetaStat
                  label="បង្កើតប្រវត្តិរូប"
                  value={profile?.profile?.created_at ? formatDateTime(profile.profile.created_at) : "—"}
                />
                <MetaStat
                  label="ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ"
                  value={profile?.profile?.updated_at ? formatDateTime(profile.profile.updated_at) : "—"}
                />
              </dl>
            </div>

            <ProfileSection
              eyebrow="សមាជិក"
              title="សមាជិក"
              description="ស្ថានភាព និងរយៈពេលសមាជិករបស់អ្នក។"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-(--border) bg-slate-50/50 p-5 lg:col-span-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ស្ថានភាព</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{statusBadge.label}</p>
                  {profile?.profile?.membership_approved_at ? (
                    <p className="mt-2 text-sm text-slate-600">
                      បានទទួល: {formatDateTime(profile.profile.membership_approved_at)}
                    </p>
                  ) : null}
                  {profile?.profile?.membership_denied_at ? (
                    <p className="mt-2 text-sm text-slate-600">
                      បានបដិសេធ: {formatDateTime(profile.profile.membership_denied_at)}
                    </p>
                  ) : null}
                  {profile?.membership.notes ? (
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">កំណត់ចំណាំ: {String(profile.membership.notes)}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-(--border) bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ចាប់ផ្តើម</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 tabular-nums">
                    {profile?.membership.membershipStartsAt ? formatDateTime(profile.membership.membershipStartsAt) : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-(--border) bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">បញ្ចប់</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 tabular-nums">
                    {profile?.membership.membershipEndsAt ? formatDateTime(profile.membership.membershipEndsAt) : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-(--border)">
                <Button variant="outline" onClick={() => router.push("/pricing_page")}>
                  មើលគម្រោង
                </Button>
                {membershipStatus !== "approved" ? (
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/payment${profile?.plan?.id ? `?plan=${encodeURIComponent(profile.plan.id)}` : ""}`)}
                  >
                    ទៅកាន់ការទូទាត់
                  </Button>
                ) : null}
              </div>
            </ProfileSection>

            <ProfileSection
              eyebrow="ព័ត៌មាន"
              title="ព័ត៌មានផ្ទាល់ខ្លួន"
              description="ព័ត៌មានទាក់ទងដែលប្រើសម្រាប់គណនីរបស់អ្នក។"
              action={
                !isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    កែប្រែ
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                      បោះបង់
                    </Button>
                    <Button onClick={handleSave} variant="primary" size="sm" disabled={isLoading}>
                      {isLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                    </Button>
                  </div>
                )
              }
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldBlock label="ឈ្មោះពេញ">
                  {isEditing ? (
                    <input
                      type="text"
                      value={edit.fullName}
                      onChange={(e) => setEdit((p) => ({ ...p, fullName: e.target.value }))}
                      className={inputClassName}
                    />
                  ) : (
                    <p className={readOnlyClassName}>{displayName}</p>
                  )}
                </FieldBlock>
                <FieldBlock label="លេខទូរស័ព្ទ">
                  {isEditing ? (
                    <input
                      type="tel"
                      value={edit.phone}
                      onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                      className={inputClassName}
                      placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                    />
                  ) : (
                    <p className={readOnlyClassName}>{edit.phone || "—"}</p>
                  )}
                </FieldBlock>
                <FieldBlock label="អាសយដ្ឋានអ៊ីមែល" hint="អ៊ីមែលមិនអាចកែប្រែបានទេ">
                  <p className={readOnlyClassName}>{displayEmail}</p>
                </FieldBlock>
                <FieldBlock label="សមាជិកតាំងពី">
                  <p className={readOnlyClassName}>{joinDate}</p>
                </FieldBlock>
              </div>
            </ProfileSection>

            <ProfileSection
              eyebrow="សុវត្ថិភាព"
              title="ការកំណត់គណនី"
              description="គ្រប់គ្រងការចូលប្រើ ការជូនដំណឹង និងគណនីរបស់អ្នក។"
            >
              <div className="rounded-xl border border-(--border) divide-y divide-(--border) overflow-hidden bg-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-5 py-4 sm:py-5 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">ចេញពីគណនី</p>
                    <p className="text-sm text-slate-600 mt-0.5">បញ្ចប់សម័យបច្ចុប្បន្ននៅលើឧបករណ៍នេះ</p>
                  </div>
                  <Button
                    onClick={async () => {
                      await signOut();
                      notify.success("បានចេញពីគណនីដោយជោគជ័យ");
                    }}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    ចេញពីគណនី
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-5 py-4 sm:py-5 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">ការជូនដំណឹងតាមអ៊ីមែល</p>
                    <p className="text-sm text-slate-600 mt-0.5">ទទួលព័ត៌មានបច្ចុប្បន្នភាព និងការជូនដំណឹងសំខាន់ៗ</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--primary)/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)" />
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-5 py-4 sm:py-5 bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-rose-700">លុបគណនី</p>
                    <p className="text-sm text-slate-600 mt-0.5">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300">
                    លុបគណនី
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

