import SectionHeading from "./SectionHeading";

const VALUES = [
  {
    title: "ចំណេះដឹងពីអ្នកជំនាញ",
    description: "សិក្សាពីអ្នកជំនាញច្បាប់ដែលមានបទពិសោធន៍ និងយល់ដឹងជ្រាលជ្រៅអំពីច្បាប់",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  },
  {
    title: "ការរៀនដែលអាចចូលប្រើបាន",
    description: "ចូលប្រើការអប់រំច្បាប់បានគ្រប់ពេល គ្រប់ទីកន្លែង—មិនមានឧបសគ្គ មានតែចំណេះដឹង",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: "ធនធានដែលទុកចិត្តបាន",
    description: "មាតិកាទាំងអស់ត្រូវបានរៀបចំ និងផ្ទៀងផ្ទាត់យ៉ាងប្រុងប្រយ័ត្នដោយអ្នកជំនាញច្បាប់",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: "ពង្រឹងសហគមន៍",
    description: "កសាងសង្គមដែលមានការយល់ដឹងអំពីច្បាប់កាន់តែប្រសើរ ម្នាក់ម្តងៗ",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
];

export default function MissionSection() {
  return (
    <section className="bg-(--paper) py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="បេសកកម្ម"
          title="ហេតុអ្វីបានជាយើងបង្កើតវេទិកានេះ"
          description="យើងជឿជាក់ថាចំណេះដឹងផ្នែកច្បាប់គួរតែអាចចូលប្រើបានសម្រាប់មនុស្សគ្រប់រូប។"
          className="mb-14"
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6 scroll-animate delay-100">
            <article className="rounded-2xl border border-(--gray-200) border-l-4 border-l-(--primary) bg-white p-7 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-xl font-semibold text-(--ink)">បេសកកម្មរបស់យើង</h3>
              <p className="mt-3 text-base leading-relaxed text-(--gray-700)">
                វេទិការបស់យើងត្រូវបានបង្កើតឡើងដើម្បីផ្សព្វផ្សាយការអប់រំច្បាប់នៅកម្ពុជា ឱ្យកាន់តែងាយយល់ និងអាចចូលដល់សាធារណជនគ្រប់រូប
                ដោយមិនគិតពីប្រវត្តិរូប ឬទីតាំងរស់នៅ។
              </p>
            </article>
            <article className="rounded-2xl border border-(--gray-200) bg-(--gray-50) p-7 transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-xl font-semibold text-(--ink)">អ្វីដែលយើងផ្តល់ជូន</h3>
              <p className="mt-3 text-base leading-relaxed text-(--gray-700)">
                តាមរយៈវីដេអូបង្រៀនយ៉ាងគ្រប់ជ្រុងជ្រោយ និងឯកសារច្បាប់លម្អិត យើងផ្តល់ចំណេះដឹងពីអ្នកជំនាញអំពីច្បាប់
                ដើម្បីជួយបុគ្គល និងអាជីវកម្មឱ្យអាចដោះស្រាយបញ្ហាច្បាប់បានដោយទំនុកចិត្ត។
              </p>
            </article>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 scroll-animate delay-200">
            {VALUES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-(--gray-200) bg-white p-5 transition-colors duration-200 hover:border-(--primary)/30 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-(--primary) text-white shadow-sm">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    {item.icon}
                  </svg>
                </div>
                <h4 className="font-semibold text-(--ink)">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-(--gray-700)">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
