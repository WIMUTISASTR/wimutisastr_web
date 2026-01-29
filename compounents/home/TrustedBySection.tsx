"use client";

export default function TrustedBySection() {
  const partners = [
    { name: "Law School", abbrev: "LAW" },
    { name: "Bar Association", abbrev: "BAR" },
    { name: "Judicial Institute", abbrev: "JUD" },
    { name: "Ministry", abbrev: "MIN" },
    { name: "Legal Firm", abbrev: "LEG" },
    { name: "Education", abbrev: "EDU" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-gray-600 mb-12 text-lg font-medium scroll-animate opacity-0 translate-y-4">
          Trusted by legal professionals and institutions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={partner.abbrev}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover:shadow-lg scroll-animate opacity-0 translate-y-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-slate-900 ring-2 ring-(--brown)/25 shadow-lg">
                <span className="text-white font-bold text-sm">{partner.abbrev}</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
