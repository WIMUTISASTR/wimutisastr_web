import type { ReactNode } from "react";
import type { TeamMember } from "../_data/team";
import SectionHeading from "./SectionHeading";

function ContactIconButton({
  href,
  label,
  title,
  children,
}: {
  href: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-(--ink) shadow-sm transition-colors duration-200 hover:bg-white cursor-pointer"
      aria-label={label}
      title={title}
    >
      {children}
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

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <li
              key={member.name}
              className={`scroll-animate overflow-hidden rounded-2xl border border-(--gray-200) bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${index % 3 === 1 ? "delay-100" : index % 3 === 2 ? "delay-200" : ""}`}
            >
              <div className="relative aspect-4/5 bg-(--gray-100)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--primary-dark)/80 via-(--primary-dark)/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-lg font-semibold leading-snug">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-(--accent-light)">{member.role}</p>
                </div>
                <div className="absolute right-3 top-3 flex gap-2">
                  {member.phone ? (
                    <ContactIconButton href={`tel:${member.phone}`} label={`ហៅទៅកាន់ ${member.name}`} title="ហៅទូរស័ព្ទ">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.58-1.58a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </ContactIconButton>
                  ) : null}
                  {member.email ? (
                    <ContactIconButton href={`mailto:${member.email}`} label={`អ៊ីមែល ${member.name}`} title="អ៊ីមែល">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m22 6-10 7L2 6" />
                      </svg>
                    </ContactIconButton>
                  ) : null}
                  {member.facebook ? (
                    <ContactIconButton href={member.facebook} label={`Facebook ${member.name}`} title="Facebook">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                        <path d="M22 12.07C22 6.477 17.523 2 11.93 2 6.477 2 2 6.477 2 12.07c0 5.05 3.657 9.236 8.438 9.93v-7.024H7.898v-2.906h2.54V9.854c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.772-1.63 1.562v1.878h2.773l-.443 2.906h-2.33V22c4.78-.694 8.437-4.88 8.437-9.93z" />
                      </svg>
                    </ContactIconButton>
                  ) : null}
                </div>
              </div>
              {(member.phone || member.email) && (
                <div className="flex flex-wrap gap-2 border-t border-(--gray-100) p-4 text-xs text-(--gray-700)">
                  {member.phone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--gray-50) px-3 py-1 ring-1 ring-(--gray-200)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72" />
                      </svg>
                      {member.phone}
                    </span>
                  ) : null}
                  {member.email ? (
                    <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-(--gray-50) px-3 py-1 ring-1 ring-(--gray-200)">
                      {member.email}
                    </span>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
