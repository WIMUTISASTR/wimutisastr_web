"use client";

import Image from "next/image";
import { useState } from "react";
import { notify } from "@/lib/utils/notify";
import Button from "@/components/Button";
import SocialLinks from "@/components/contact/SocialLinks";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_INTL_DISPLAY,
  SOCIAL_LINKS,
} from "@/lib/seo/site";

type ContactFormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: ContactFormState = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const INPUT_CLASS =
  "w-full border border-(--gray-200) bg-white px-4 py-3.5 text-base text-(--ink) placeholder:text-(--gray-700)/50 transition-colors duration-200 focus:border-(--primary) focus:outline-none";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2.5 block text-sm font-semibold uppercase tracking-wide text-(--gray-700)">
      {children}
    </label>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 border-b border-(--gray-100) py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold uppercase tracking-wide text-(--gray-700)">{label}</dt>
      <dd className="text-base leading-relaxed text-(--ink)">{children}</dd>
    </div>
  );
}

export default function ContactContent() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      notify.error("សូមបំពេញឈ្មោះ អ៊ីមែល និងសារ។");
      return;
    }
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      notify.success("សូមអរគុណសម្រាប់ការទាក់ទងមកយើង។ យើងនឹងឆ្លើយតបឆាប់ៗនេះ។");
      setForm(INITIAL_FORM);
    } catch {
      notify.error("មានបញ្ហាបានកើតឡើង។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-(--gray-200)">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <Image
            src="/asset/features-section-backdrop.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--primary-dark) 82%, transparent) 0%, color-mix(in srgb, var(--primary) 68%, transparent) 55%, color-mix(in srgb, var(--primary-dark) 80%, transparent) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--accent-light) sm:text-base">
              WIMUTISASTR Law Office
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              ទាក់<span className="text-(--accent-light)">ទង</span>មកយើង
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl">
              សូមទាក់ទងមកយើង ប្រសិនបើអ្នកមានសំណួរអំពីសមាជិក វគ្គសិក្សា ឬឯកសារច្បាប់។
            </p>
            <div className="mt-8 flex justify-center border-t border-white/15 pt-6">
              <SocialLinks links={SOCIAL_LINKS} variant="light" className="justify-center" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-(--gray-50) py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <article className="border border-(--gray-200) bg-white">
            <div className="grid lg:grid-cols-12">
              <aside className="border-b border-(--gray-200) px-6 py-10 sm:px-8 lg:col-span-5 lg:border-b-0 lg:border-r">
                <h2 className="text-xl font-semibold text-(--ink) sm:text-2xl">ព័ត៌មានទំនាក់ទំនង</h2>
                <p className="mt-3 text-base leading-relaxed text-(--gray-700)">
                  ទាក់ទងការិយាល័យដោយផ្ទាល់តាមរយៈព័ត៌មានខាងក្រោម ឬផ្ញើសារតាមប្រព័ន្ធទម្រង់។
                </p>

                <dl className="mt-8">
                  <ContactRow label="អាសយដ្ឋាន">Phnom Penh, Cambodia</ContactRow>
                  <ContactRow label="ទូរស័ព្ទ">
                    <a href={`tel:${CONTACT_PHONE}`} className="text-(--primary) hover:underline cursor-pointer">
                      {CONTACT_PHONE_INTL_DISPLAY}
                    </a>
                  </ContactRow>
                  <ContactRow label="អ៊ីមែល">
                    <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-(--primary) hover:underline cursor-pointer">
                      {CONTACT_EMAIL}
                    </a>
                  </ContactRow>
                  <ContactRow label="ម៉ោងធ្វើការ">ចន្ទ – សៅរ៍ · 8:00 ព្រឹក – 5:00 ល្ងាច</ContactRow>
                  <div className="py-4">
                    <dt className="text-sm font-semibold uppercase tracking-wide text-(--gray-700)">បណ្តាញសង្គម</dt>
                    <dd className="mt-3">
                      <SocialLinks links={SOCIAL_LINKS} />
                    </dd>
                  </div>
                </dl>
              </aside>

              <div className="px-6 py-10 sm:px-8 lg:col-span-7">
                <h2 className="text-xl font-semibold text-(--ink) sm:text-2xl">ផ្ញើសារមកយើង</h2>
                <p className="mt-3 text-base leading-relaxed text-(--gray-700)">
                  សូមបញ្ចូលព័ត៌មានរបស់អ្នក និងពិពណ៌នាសំណើឱ្យច្បាស់លាស់។ យើងនឹងឆ្លើយតបក្នុងរយៈពេលធ្វើការ។
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <FieldLabel>ឈ្មោះពេញ</FieldLabel>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={handleChange("fullName")}
                        className={INPUT_CLASS}
                        placeholder="ឈ្មោះរបស់អ្នក"
                      />
                    </div>
                    <div>
                      <FieldLabel>អ៊ីមែល</FieldLabel>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        className={INPUT_CLASS}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <FieldLabel>ទូរស័ព្ទ</FieldLabel>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        className={INPUT_CLASS}
                        placeholder="ជាជម្រើស"
                      />
                    </div>
                    <div>
                      <FieldLabel>ប្រធានបទ</FieldLabel>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={handleChange("subject")}
                        className={INPUT_CLASS}
                        placeholder="តើយើងអាចជួយអ្វីបាន?"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>សារ</FieldLabel>
                    <textarea
                      value={form.message}
                      onChange={handleChange("message")}
                      rows={7}
                      className={`${INPUT_CLASS} resize-y min-h-40`}
                      placeholder="សរសេរសាររបស់អ្នកនៅទីនេះ..."
                    />
                  </div>

                  <div className="flex items-center justify-end border-t border-(--gray-100) pt-5">
                    <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="rounded-lg">
                      {isSubmitting ? "កំពុងផ្ញើ..." : "ផ្ញើសារ"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
