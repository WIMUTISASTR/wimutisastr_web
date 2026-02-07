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

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Turnstile verification
    if (!turnstileToken) {
      toast.error("Please complete the security check");
      return;
    }
    
    setLoading(true);

    try {
      // Verify Turnstile token on server
      const turnstileResponse = await fetch('/api/turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      
      const turnstileResult = await turnstileResponse.json();
      
      if (!turnstileResult.success) {
        toast.error("Security verification failed. Please try again.");
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        toast.error(signInError.message || "Failed to sign in. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Welcome back! Sign in successful.");
        // Redirect to home page or profile page
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1000);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
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
            title="Welcome Back"
            subtitle="Sign in to access your legal education resources"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              disabled={loading}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={loading}
              rightElement={
                <Link
                  href="#"
                  className="text-sm text-(--brown-strong) hover:text-(--brown) font-medium"
                >
                  Forgot password?
                </Link>
              }
            />

            <Checkbox
              id="remember"
              name="remember"
              label="Remember me"
              disabled={loading}
            />

            {/* Cloudflare Turnstile Bot Protection */}
            <div className="flex justify-center">
              <Turnstile onVerify={handleTurnstileVerify} />
            </div>

            <Button type="submit" fullWidth disabled={loading || !turnstileToken}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Divider className="my-8" />

          <div className="text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <FormLink href="/auth/register">Sign up</FormLink>
            </p>
          </div>
        </FormCard>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <FormLink href="#">Terms of Service</FormLink> and{" "}
            <FormLink href="#">Privacy Policy</FormLink>
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
            <LoadingState label="Loading..." />
          </div>
        </PageContainer>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
