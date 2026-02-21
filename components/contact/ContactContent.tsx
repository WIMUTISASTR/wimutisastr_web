"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/Button";

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

export default function ContactContent() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("សូមបំពេញឈ្មោះ អ៊ីមែល និងសារ។");
      return;
    }
    try {
      setIsSubmitting(true);
      // Placeholder: no backend yet. This confirms the submission UI.
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success("សូមអរគុណសម្រាប់ការទាក់ទងមកយើង។ យើងនឹងឆ្លើយតបឆាប់ៗនេះ។");
      setForm(INITIAL_FORM);
    } catch {
      toast.error("មានបញ្ហាបានកើតឡើង។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative bg-slate-900 text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Contact background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10" />
        <div className="absolute inset-0 bg-(--brown-soft) opacity-20 z-10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">ទាក់ទងមកយើង</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            សូមទាក់ទងមកយើង ប្រសិនបើអ្នកមានសំណួរអំពីសមាជិកភាព វគ្គសិក្សា ឬឯកសារច្បាប់។
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ព័ត៌មានទំនាក់ទំនង</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <div className="text-sm text-gray-500">អាសយដ្ឋាន</div>
                  <div className="font-semibold text-gray-900">Phnom Penh, Cambodia</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ទូរស័ព្ទ</div>
                  <div className="font-semibold text-gray-900">+855 12 345 678</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">អ៊ីមែល</div>
                  <div className="font-semibold text-gray-900">info@wimutisastr.com</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ម៉ោងធ្វើការ</div>
                  <div className="font-semibold text-gray-900">ចន្ទ - សៅរ៍, 8:00 ព្រឹក - 5:00 ល្ងាច</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ជំនួយរហ័ស</h3>
              <p className="text-gray-700">
                ដើម្បីទទួលបានជំនួយលឿន សូមបញ្ចូលអ៊ីមែលសមាជិកភាព និងពិពណ៌នាបញ្ហារបស់អ្នកឱ្យខ្លី។
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ផ្ញើសារមកយើង</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ឈ្មោះពេញ</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brown)"
                      placeholder="ឈ្មោះរបស់អ្នក"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">អ៊ីមែល</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brown)"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ទូរស័ព្ទ</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brown)"
                      placeholder="ជាជម្រើស"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ប្រធានបទ</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brown)"
                      placeholder="តើយើងអាចជួយអ្វីបាន?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">សារ</label>
                  <textarea
                    value={form.message}
                    onChange={handleChange("message")}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brown)"
                    placeholder="សរសេរសាររបស់អ្នកនៅទីនេះ..."
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "កំពុងផ្ញើ..." : "ផ្ញើសារ"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
