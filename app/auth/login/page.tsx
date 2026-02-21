"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/instance";
import PageContainer from "@/components/PageContainer";
import FormSection from "@/components/FormSection";
import FormCard from "@/components/FormCard";
import FormHeader from "@/components/FormHeader";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import Divider from "@/components/Divider";
import FormLink from "@/components/FormLink";
import Turnstile from "@/components/Turnstile";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? searchParams.get("redirectTo");
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileRequired, setTurnstileRequired] = useState(true);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileUnconfigured = useCallback(() => {
    // If Turnstile is not configured, don't require it
    setTurnstileRequired(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Turnstile verification only if it's required and configured
    if (turnstileRequired && !turnstileToken) {
      toast.error("សូមបំពេញការផ្ទៀងផ្ទាត់សុវត្ថិភាព");
      return;
    }
    
    setLoading(true);

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

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        toast.error(signInError.message || "ចូលគណនីមិនជោគជ័យ។ សូមពិនិត្យព័ត៌មានសម្ងាត់របស់អ្នក។");
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("សូមស្វាគមន៍ត្រឡប់មកវិញ! ចូលគណនីបានជោគជ័យ។");
        // Redirect to home page or profile page
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1000);
      }
    } catch {
      toast.error("មានកំហុសមិនបានរំពឹងទុក។ សូមព្យាយាមម្តងទៀត។");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <PageContainer>
      <FormSection>
        <FormCard>
          <FormHeader
            title="សូមស្វាគមន៍ត្រឡប់មកវិញ"
            subtitle="ចូលគណនីដើម្បីចូលប្រើធនធានអប់រំច្បាប់របស់អ្នក"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="បញ្ចូលពាក្យសម្ងាត់របស់អ្នក"
              disabled={loading}
              rightElement={
                <Link
                  href="#"
                  className="text-sm text-(--brown-strong) hover:text-(--brown) font-medium"
                >
                  ភ្លេចពាក្យសម្ងាត់?
                </Link>
              }
            />

            <Checkbox
              id="remember"
              name="remember"
              label="ចងចាំខ្ញុំ"
              disabled={loading}
            />

            {/* Cloudflare Turnstile Bot Protection */}
            <div className="flex justify-center">
              <Turnstile 
                onVerify={handleTurnstileVerify} 
                onUnconfigured={handleTurnstileUnconfigured}
              />
            </div>

            <Button type="submit" fullWidth disabled={loading || (turnstileRequired && !turnstileToken)}>
              {loading ? "កំពុងចូលគណនី..." : "ចូលគណនី"}
            </Button>
          </form>

          <Divider className="my-8" />

          <div className="text-center">
            <p className="text-gray-600">
              មិនទាន់មានគណនីមែនទេ?{" "}
              <FormLink href="/auth/register">ចុះឈ្មោះ</FormLink>
            </p>
          </div>
        </FormCard>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            តាមរយៈការចូលគណនី អ្នកយល់ព្រមតាម{" "}
            <FormLink href="#">លក្ខខណ្ឌសេវាកម្ម</FormLink> និង{" "}
            <FormLink href="#">គោលការណ៍ឯកជនភាព</FormLink>
          </p>
        </div>
      </FormSection>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="min-h-screen flex items-center justify-center">
            <LoadingState label="កំពុងផ្ទុក..." />
          </div>
        </PageContainer>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
