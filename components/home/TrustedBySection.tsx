"use client";

export default function TrustedBySection() {
  const partners = [
    { name: "សាលាច្បាប់", abbrev: "LAW" },
    { name: "គណៈមេធាវី", abbrev: "BAR" },
    { name: "វិទ្យាស្ថានតុលាការ", abbrev: "JUD" },
    { name: "ក្រសួង", abbrev: "MIN" },
    { name: "ក្រុមហ៊ុនច្បាប់", abbrev: "LEG" },
    { name: "អប់រំ", abbrev: "EDU" },
  ];

  return (
    <section className="border-t border-(--gray-200) bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm font-medium leading-relaxed text-(--gray-700) sm:text-base scroll-animate opacity-0 translate-y-4">
          ទទួលការជឿទុកចិត្តពីអ្នកជំនាញច្បាប់ និងស្ថាប័ននានា
        </p>
        <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <div
              key={partner.abbrev}
              className="flex flex-col items-center rounded-xl border border-(--gray-200) bg-(--gray-50)/50 px-4 py-6 text-center transition-colors duration-200 hover:border-(--gray-300) hover:bg-white scroll-animate opacity-0 translate-y-4"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 shadow-md ring-1 ring-(--brown)/20">
                <span className="text-xs font-bold tracking-wide text-white">{partner.abbrev}</span>
              </div>
              <p className="mt-3 text-xs font-medium leading-snug text-(--gray-700)">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
