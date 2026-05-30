import type { ReactNode } from "react";
import Image from "next/image";
import { EXPERT_EXPERIENCE, EXPERT_SPECIALIZATIONS } from "../_data/team";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/seo/site";
import SectionHeading from "./SectionHeading";

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-(--gray-200) bg-white p-7 shadow-sm scroll-animate">
      <h3 className="text-xl font-semibold text-(--ink)">{title}</h3>
      <div className="mt-5 space-y-4 text-(--gray-700)">{children}</div>
    </article>
  );
}

export default function LeadExpertSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="អ្នកជំនាញដឹកនាំ"
          title="ស្គាល់អ្នកជំនាញរបស់យើង"
          description="ឯកសារ និងវីដេអូទាំងអស់ត្រូវបានរៀបចំយ៉ាងម៉ត់ចត់ដោយអ្នកជំនាញច្បាប់ដែលមានបទពិសោធន៍របស់យើង។"
          className="mb-14"
        />

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="scroll-animate delay-100 lg:col-span-5">
            <div className="relative mx-auto aspect-4/5 max-w-xs overflow-hidden shadow-lg">
              <Image
                src="/asset/teacherImage.png"
                alt="Men Vuth"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
                priority
              />
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7 scroll-animate delay-200">
            <div>
              <h3 className="text-3xl font-semibold text-(--ink) sm:text-4xl">Men Vuth</h3>
              <p className="mt-2 text-lg font-medium text-(--primary)">អ្នកជំនាញច្បាប់</p>
              <p className="mt-4 leading-relaxed text-(--gray-700)">
                ឯកសារ និងវីដេអូទាំងអស់លើវេទិកានេះត្រូវបានរៀបចំដោយអ្នកជំនាញច្បាប់របស់យើង ដើម្បីផ្តល់ចំណេះដឹងដែលអាចអនុវត្តបានជាក់ស្តែង។
              </p>
            </div>

            <div className="rounded-2xl border border-(--gray-200) bg-(--gray-50) p-6">
              <h4 className="font-semibold text-(--ink)">ជំនាញឯកទេស</h4>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {EXPERT_SPECIALIZATIONS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-(--gray-700)">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary)" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <InfoCard title="ព័ត៌មានផ្ទាល់ខ្លួន">
            <p>
              <span className="font-semibold text-(--ink)">ឈ្មោះពេញ:</span> Men Vuth
            </p>
            <p>
              <span className="font-semibold text-(--ink)">ភេទ:</span> ប្រុស
            </p>
            <p>
              <span className="font-semibold text-(--ink)">សញ្ជាតិ:</span> ខ្មែរ
            </p>
            <p>
              <span className="font-semibold text-(--ink)">ថ្ងៃខែឆ្នាំកំណើត:</span> 5 ឧសភា 1984
            </p>
            <p>
              <span className="font-semibold text-(--ink)">ទីកន្លែងកំណើត:</span> ភូមិតាកវ៉ាន់ ឃុំឧត្តមសុរិយា ស្រុកត្រាំកក់ ខេត្តតាកែវ
            </p>
          </InfoCard>

          <InfoCard title="ការអប់រំ">
            <div>
              <p className="font-semibold text-(--ink)">2006–2010</p>
              <p className="text-sm">
                បរិញ្ញាបត្រនីតិសាស្ត្រ (ឯកទេសភាសាបារាំង), សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច
              </p>
            </div>
            <div>
              <p className="font-semibold text-(--ink)">2010–2013</p>
              <p className="text-sm">
                បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកច្បាប់អន្តរជាតិ និងប្រៀបធៀប, សាកលវិទ្យាល័យ Lyon II និង សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ
              </p>
            </div>
          </InfoCard>
        </div>

        <article className="mt-6 rounded-2xl border border-(--gray-200) bg-white p-7 shadow-sm scroll-animate delay-100">
          <h3 className="text-xl font-semibold text-(--ink)">បទពិសោធន៍វិជ្ជាជីវៈ</h3>
          <ul className="mt-6 space-y-5">
            {EXPERT_EXPERIENCE.map((item) => (
              <li key={item.period} className="border-l-4 border-(--primary) pl-5">
                <p className="font-semibold text-(--ink)">{item.period}</p>
                <p className="mt-1 text-sm text-(--gray-700)">{item.detail}</p>
              </li>
            ))}
          </ul>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <InfoCard title="ភាសា">
            <ul className="space-y-2">
              {["ខ្មែរ — ភាសាកំណើត", "អង់គ្លេស", "បារាំង"].map((lang) => (
                <li key={lang} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-(--primary)" aria-hidden />
                  {lang}
                </li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard title="ព័ត៌មានទំនាក់ទំនង">
            <p>
              <span className="font-semibold text-(--ink)">ទូរស័ព្ទ:</span>{" "}
              <a href={`tel:${CONTACT_PHONE}`} className="text-(--primary) hover:underline cursor-pointer">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </p>
            <p>
              <span className="font-semibold text-(--ink)">អ៊ីមែល:</span>{" "}
              <a href="mailto:vuthmen5@gmail.com" className="text-(--primary) hover:underline cursor-pointer">
                vuthmen5@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold text-(--ink)">អាសយដ្ឋាន:</span>{" "}
              <span className="text-sm">
                ផ្ទះលេខ 24Q ផ្លូវលេខ 36 ភូមិភ្នំពេញថ្មី ឃុំព្រែកអញ្ចាញ ស្រុកមុខកំពូល ខេត្តកណ្ដាល
              </span>
            </p>
          </InfoCard>
        </div>
      </div>
    </section>
  );
}
