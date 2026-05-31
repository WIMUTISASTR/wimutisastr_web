import type { ReactNode } from "react";
import Image from "next/image";
import type { LeadExpert } from "../_data/team";
import { LEAD_EXPERT } from "../_data/team";
import SectionHeading from "./SectionHeading";

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-(--primary)">
        <span className="h-px flex-1 bg-(--gray-200)" aria-hidden />
        {title}
        <span className="h-px flex-1 bg-(--gray-200)" aria-hidden />
      </h4>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MetaLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 text-sm text-white/90 transition-colors duration-200 hover:text-white cursor-pointer"
    >
      <span className="h-1 w-1 shrink-0 rounded-full bg-(--accent-light)" aria-hidden />
      <span>{label}</span>
    </a>
  );
}

export default function LeadExpertSection() {
  const expert: LeadExpert = LEAD_EXPERT;

  return (
    <section className="border-t border-(--gray-200) bg-(--gray-50) py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="អ្នកជំនាញដឹកនាំ"
          title="ស្គាល់អ្នកជំនាញរបស់យើង"
          description="ឯកសារ និងវីដេអូទាំងអស់ត្រូវបានរៀបចំយ៉ាងម៉ត់ចត់ដោយអ្នកជំនាញច្បាប់ដែលមានបទពិសោធន៍របស់យើង។"
          className="mb-12"
        />

        <article className="scroll-animate overflow-hidden border border-(--gray-200) bg-white">
          {/* Profile header */}
          <header
            className="relative px-6 py-10 sm:px-10 sm:py-12"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, color-mix(in srgb, var(--primary-light) 85%, var(--primary)) 100%)",
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-(--accent-light) opacity-[0.08] blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-(--accent) opacity-[0.06] blur-3xl" aria-hidden />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="relative h-44 w-36 shrink-0 overflow-hidden ring-2 ring-white/20 sm:h-52 sm:w-40 lg:h-56 lg:w-44">
                <Image
                  src={expert.image}
                  alt={expert.imageAlt}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>

              <div className="min-w-0 flex-1 text-center lg:text-left">
                <p className="text-sm font-medium tracking-wide text-(--accent-light)">{expert.nameLatin}</p>
                <h3 className="mt-1 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">{expert.nameKh}</h3>
                <p className="mt-2 text-base font-medium text-white/90 sm:text-lg">{expert.title}</p>
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/75 lg:mx-0 lg:max-w-none lg:text-base">
                  {expert.bio}
                </p>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
                  <MetaLink href={`tel:${expert.contact.phone}`} label={expert.contact.phone} />
                  <MetaLink href={`mailto:${expert.contact.email}`} label={expert.contact.email} />
                  {expert.contact.facebook ? (
                    <MetaLink href={expert.contact.facebook} label="Facebook" external />
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          {/* Unified body */}
          <div className="space-y-12 px-6 py-10 sm:px-10 sm:py-12">
            <ProfileSection title="ជំនាញឯកទេស">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expert.specializations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 bg-(--gray-50) px-4 py-3 text-sm leading-relaxed text-(--gray-700)"
                  >
                    <span className="mt-2 h-1 w-4 shrink-0 rounded-full bg-(--primary)" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </ProfileSection>

            <ProfileSection title="បទពិសោធន៍វិជ្ជាជីវៈ">
              <ol className="divide-y divide-(--gray-100)">
                {expert.experience.map((item, index) => (
                  <li
                    key={`${item.period}-${index}`}
                    className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-8 lg:grid-cols-[16rem_1fr]"
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-start">
                      <p className="text-sm font-semibold text-(--ink)">{item.period}</p>
                      {item.ongoing ? (
                        <span className="bg-(--primary)/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--primary)">
                          បច្ចុប្បន្ន
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-(--gray-700)">{item.title}</p>
                  </li>
                ))}
              </ol>
            </ProfileSection>

            <div className="grid gap-12 lg:grid-cols-2">
              <ProfileSection title="ការអប់រំ">
                <ul className="space-y-5">
                  {expert.education.map((item) => (
                    <li key={item.period} className="border-l-2 border-(--primary)/30 pl-4">
                      <p className="text-sm font-semibold text-(--ink)">{item.period}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-(--gray-700)">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </ProfileSection>

              <ProfileSection title="ព័ត៌មានបន្ថែម">
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {[
                    { label: "ភេទ", value: expert.personal.gender },
                    { label: "សញ្ជាតិ", value: expert.personal.nationality },
                    { label: "ថ្ងៃកំណើត", value: expert.personal.dateOfBirth },
                    { label: "ភាសា", value: expert.languages.join(" · ") },
                    { label: "ទីកន្លែងកំណើត", value: expert.personal.birthplace, wide: true },
                    { label: "អាសយដ្ឋាន", value: expert.contact.address, wide: true },
                  ].map((row) => (
                    <div key={row.label} className={row.wide ? "sm:col-span-2" : undefined}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-(--gray-700)">{row.label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-(--ink)">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </ProfileSection>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
