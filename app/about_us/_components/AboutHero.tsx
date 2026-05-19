import Image from "next/image";

const HERO_BACKDROP = "/asset/features-section-backdrop.jpg";

export default function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-(--gray-200)">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src={HERO_BACKDROP}
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
              "linear-gradient(135deg, color-mix(in srgb, var(--primary-dark) 78%, transparent) 0%, color-mix(in srgb, var(--primary) 62%, transparent) 55%, color-mix(in srgb, var(--primary-dark) 75%, transparent) 100%)",
          }}
        />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-(--accent) opacity-[0.12] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-(--accent-light) opacity-[0.1] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center scroll-animate">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent-light)">
            WIMUTISASTR Law Office
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            អំពី<span className="text-(--accent-light)">យើង</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
            យើងបង្កើតវេទិកានេះដើម្បីធ្វើឱ្យការអប់រំច្បាប់កាន់តែងាយចូលប្រើ និងទុកចិត្តបានសម្រាប់សាធារណជនគ្រប់រូបនៅកម្ពុជា។
          </p>
        </div>
      </div>
    </section>
  );
}
