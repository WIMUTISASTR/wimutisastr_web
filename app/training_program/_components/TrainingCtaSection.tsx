import Link from "next/link";

export default function TrainingCtaSection() {
  return (
    <section className="border-t border-(--gray-200) bg-(--gray-50) py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="scroll-animate rounded-2xl border border-(--gray-200) bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
          <h2 className="text-2xl font-semibold tracking-tight text-(--ink) sm:text-3xl">
            ត្រៀមខ្លួនចាប់ផ្តើម?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--gray-700) sm:text-lg">
            ទាក់ទងមកយើងសម្រាប់ព័ត៌មានបន្ថែម ឬចុះឈ្មោះប្រើប្រាស់វេទិកាដើម្បីចូលប្រើធនធានច្បាប់ពេញលេញ។
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/contact"
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-(--primary) px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-(--primary-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 sm:w-auto"
            >
              សួរព័ត៌មាន
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-(--gray-300) bg-white px-8 py-3 text-sm font-semibold text-(--ink) shadow-sm transition-colors duration-200 hover:border-(--primary) hover:text-(--primary) hover:bg-(--gray-50) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 sm:w-auto"
            >
              ចុះឈ្មោះប្រើប្រាស់
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
