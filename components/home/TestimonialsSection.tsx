"use client";

interface TestimonialsSectionProps {
  className?: string;
}

export default function TestimonialsSection({ className = "" }: TestimonialsSectionProps) {
  const testimonials = [
    {
      name: "Sok Chanthy",
      role: "អ្នកជំនាញច្បាប់",
      organization: "ក្រសួងយុត្តិធម៌",
      content: "វគ្គវីដេអូដ៏គ្រប់ជ្រុងជ្រោយនេះបានផ្តល់ចំណេះដឹងដ៏មានតម្លៃអំពីប្រព័ន្ធច្បាប់កម្ពុជា។ ការរៀបចំមាតិកា និងការបង្រៀនពីអ្នកជំនាញបានជួយខ្ញុំយ៉ាងខ្លាំងក្នុងការអភិវឌ្ឍអាជីព។",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Pheakdey Samnang",
      role: "និស្សិតច្បាប់",
      organization: "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច",
      content: "ជានិស្សិតច្បាប់ ការចូលប្រើឯកសារច្បាប់ និងវីដេអូមេរៀនដែលរៀបចំបានល្អ បានបង្កើនការយល់ដឹងរបស់ខ្ញុំលើគោលគំនិតច្បាប់ស្មុគស្មាញយ៉ាងខ្លាំង។ សូមណែនាំយ៉ាងខ្លាំង!",
      avatar: "PS",
      rating: 5,
    },
    {
      name: "Vanna Sophea",
      role: "អ្នកប្រឹក្សាច្បាប់",
      organization: "ក្រុមហ៊ុនច្បាប់ឯកជន",
      content: "គុណភាពមាតិកាអប់រំគឺល្អឥតខ្ចោះ។ វាជាឧបករណ៍យោងដ៏ប្រសើរសម្រាប់អ្នកអនុវត្តច្បាប់ទាំងថ្មី និងមានបទពិសោធន៍។ វេទិកានេះងាយស្រួលប្រើ និងមានមាតិកាគ្រប់ជ្រុងជ្រោយ។",
      avatar: "VS",
      rating: 5,
    },
  ];

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-(--brown)/10 rounded-full">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            <span className="text-sm font-semibold text-(--brown)">ទទួលការជឿទុកចិត្តពីអ្នកជំនាញច្បាប់</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            មតិយោបល់ពី <span className="text-(--brown)">សមាជិករបស់យើង</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ចូលរួមជាមួយអ្នកជំនាញច្បាប់ និងនិស្សិតរាប់រយនាក់ដែលពេញចិត្ត និងបានអភិវឌ្ឍអាជីពរបស់ពួកគេ
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-(--brown)/30 hover:shadow-xl transition-all duration-300 scroll-animate opacity-0 translate-y-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-(--brown)"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <svg
                  className="absolute -top-2 -left-1 w-8 h-8 text-(--brown)/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 leading-relaxed pl-6 italic">
                  {testimonial.content}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-(--brown) flex items-center justify-center text-white font-bold shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-(--brown) font-medium">{testimonial.organization}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">មតិយោបល់បានផ្ទៀងផ្ទាត់</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">ពិតប្រាកដ 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">ពិន្ទុវាយតម្លៃ 4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
