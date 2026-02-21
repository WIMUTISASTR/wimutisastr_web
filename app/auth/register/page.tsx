"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/instance";
import PageContainer from "@/components/PageContainer";
import FormSection from "@/components/FormSection";
import FormCard from "@/components/FormCard";
import FormHeader from "@/components/FormHeader";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import FormLink from "@/components/FormLink";
import Turnstile from "@/components/Turnstile";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileRequired, setTurnstileRequired] = useState(true);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileUnconfigured = useCallback(() => {
    setTurnstileRequired(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Turnstile verification only if required
    if (turnstileRequired && !turnstileToken) {
      toast.error("សូមបំពេញការផ្ទៀងផ្ទាត់សុវត្ថិភាព");
      return;
    }
    
    const newErrors: typeof errors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "ពាក្យសម្ងាត់មិនត្រូវគ្នា";
      toast.error("ពាក្យសម្ងាត់មិនត្រូវគ្នា");
    }
    if (formData.password.length < 8) {
      newErrors.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 តួអក្សរ";
      toast.error("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 តួអក្សរ");
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "សូមយល់ព្រមលក្ខខណ្ឌ និងគោលការណ៍";
      toast.error("សូមយល់ព្រមលក្ខខណ្ឌ និងគោលការណ៍");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrors({});

      try {
        // Verify Turnstile token on server (only if we have a token)
        if (turnstileToken) {
          const turnstileResponse = await fetch('/api/turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: turnstileToken }),
          });
          
          const turnstileResult = await turnstileResponse.json();
          
          if (!turnstileResult.success) {
            toast.error("ការផ្ទៀងផ្ទាត់សុវត្ថិភាពបរាជ័យ។ សូមព្យាយាមម្តងទៀត។");
            setLoading(false);
            return;
          }
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (signUpError) {
          toast.error(signUpError.message || "បង្កើតគណនីមិនជោគជ័យ។ សូមព្យាយាមម្តងទៀត។");
          setLoading(false);
          return;
        }

        if (data.user) {
          toast.success("បង្កើតគណនីបានជោគជ័យ! សូមស្វាគមន៍!");
          // Redirect to home page or show success message
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1000);
        }
      } catch (err) {
        toast.error("មានកំហុសមិនបានរំពឹងទុក។ សូមព្យាយាមម្តងទៀត។");
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  return (
    <PageContainer>
      <FormSection>
        <FormCard>
          <FormHeader
            title="បង្កើតគណនី"
            subtitle="ចូលរួមជាមួយយើងដើម្បីចូលប្រើធនធានអប់រំច្បាប់យ៉ាងគ្រប់ជ្រុងជ្រោយ"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="fullName"
              label="ឈ្មោះពេញ"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="ឈ្មោះរបស់អ្នក"
              disabled={loading}
            />

            <Input
              type="email"
              name="email"
              label="អាសយដ្ឋានអ៊ីមែល"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              disabled={loading}
            />

            <Input
              type="password"
              name="password"
              label="ពាក្យសម្ងាត់"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="យ៉ាងហោចណាស់ 8 តួអក្សរ"
              helperText="ត្រូវមានយ៉ាងហោចណាស់ 8 តួអក្សរ"
              disabled={loading}
              error={errors.password}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="បញ្ជាក់ពាក្យសម្ងាត់"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក"
              error={errors.confirmPassword}
              disabled={loading}
            />

            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              disabled={loading}
              label={
                <>
                  ខ្ញុំយល់ព្រមតាម <FormLink href="#">លក្ខខណ្ឌសេវាកម្ម</FormLink> និង{" "}
                  <FormLink href="#">គោលការណ៍ឯកជនភាព</FormLink>
                </>
              }
            />
            {errors.agreeToTerms && (
              <p className="text-xs text-red-600">{errors.agreeToTerms}</p>
            )}

            {/* Cloudflare Turnstile Bot Protection */}
            <div className="flex justify-center">
              <Turnstile 
                onVerify={handleTurnstileVerify}
                onUnconfigured={handleTurnstileUnconfigured}
              />
            </div>

            <Button type="submit" fullWidth disabled={loading || (turnstileRequired && !turnstileToken)}>
              {loading ? "កំពុងបង្កើតគណនី..." : "បង្កើតគណនី"}
            </Button>
          </form>

          <Divider className="my-8" />

          <div className="text-center">
            <p className="text-gray-600">
              មានគណនីរួចហើយមែនទេ?{" "}
              <FormLink href="/auth/login">ចូលគណនី</FormLink>
            </p>
          </div>
        </FormCard>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ការបង្កើតគណនីនឹងអនុញ្ញាតឱ្យអ្នកចូលប្រើបណ្ណាល័យធនធានច្បាប់ពេញលេញរបស់យើង
          </p>
        </div>
      </FormSection>
    </PageContainer>
  );
}
