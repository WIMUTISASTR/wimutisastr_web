import type { ReactNode } from "react";
import type { TeamMember } from "../_data/team";
import SectionHeading from "./SectionHeading";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const latinWords = words.filter((w) => /^[A-Za-z]/.test(w));

  if (latinWords.length >= 2) {
    return (latinWords[0][0] + latinWords[1][0]).toUpperCase();
  }
  if (latinWords.length === 1 && latinWords[0].length >= 2) {
    return latinWords[0].slice(0, 2).toUpperCase();
  }

  return words[0]?.slice(0, 1) ?? "?";
}

function hasContact(member: TeamMember): boolean {
  return Boolean(member.phone || member.email || member.facebook);
}

function ContactRow({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group/row flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--gray-700) transition-colors duration-200 hover:bg-(--gray-50) hover:text-(--primary) cursor-pointer"
      aria-label={label}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--gray-50) text-(--primary) ring-1 ring-(--gray-200) transition-colors duration-200 group-hover/row:bg-(--primary) group-hover/row:text-white group-hover/row:ring-(--primary)">
        {children}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
    </a>
  );
}

export default function TeamSection({ members }: { members: TeamMember[] }) {
  return (
    <section className="border-t border-(--gray-200) bg-(--gray-50) py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ក្រុមការងារ"
          title="ក្រុមការងាររបស់យើង"
          description="សូមស្គាល់អ្នកជំនាញដែលគាំទ្របេសកកម្មរបស់យើងក្នុងការធ្វើឱ្យចំណេះដឹងច្បាប់អាចចូលប្រើបាន។"
          className="mb-12"
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {members.map((member, index) => (
            <li
              key={member.name}
              className={`scroll-animate group flex h-full flex-col overflow-hidden rounded-2xl border border-(--gray-200) bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-(--primary)/25 hover:shadow-md ${index % 3 === 1 ? "delay-100" : index % 3 === 2 ? "delay-200" : ""}`}
            >
              <div className="h-1 bg-linear-to-r from-(--primary-dark) via-(--primary) to-(--accent-dark) opacity-80 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-(--primary-dark) to-(--primary-light) text-lg font-semibold text-white shadow-sm ring-4 ring-(--primary)/10"
                    aria-hidden
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-lg font-semibold leading-snug text-(--ink)">{member.name}</h3>
                    <p className="mt-1.5 inline-block rounded-full bg-(--primary)/8 px-2.5 py-0.5 text-xs font-semibold leading-relaxed text-(--primary)">
                      {member.role}
                    </p>
                  </div>
                </div>

                {hasContact(member) ? (
                  <div className="mt-5 flex flex-1 flex-col gap-0.5 border-t border-(--gray-100) pt-5">
                    {member.phone ? (
                      <ContactRow href={`tel:${member.phone}`} label={member.phone}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.58-1.58a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z"
                          />
                        </svg>
                      </ContactRow>
                    ) : null}
                    {member.email ? (
                      <ContactRow href={`mailto:${member.email}`} label={member.email}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="m22 6-10 7L2 6" />
                        </svg>
                      </ContactRow>
                    ) : null}
                    {member.facebook ? (
                      <ContactRow href={member.facebook} label="Facebook">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                          <path d="M22 12.07C22 6.477 17.523 2 11.93 2 6.477 2 2 6.477 2 12.07c0 5.05 3.657 9.236 8.438 9.93v-7.024H7.898v-2.906h2.54V9.854c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.772-1.63 1.562v1.878h2.773l-.443 2.906h-2.33V22c4.78-.694 8.437-4.88 8.437-9.93z" />
                        </svg>
                      </ContactRow>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
