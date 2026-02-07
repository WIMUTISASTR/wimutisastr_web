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
    
    const newErrors: typeof errors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      toast.error("Passwords do not match");
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      toast.error("Password must be at least 8 characters");
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Please agree to the terms and conditions";
      toast.error("Please agree to the terms and conditions");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrors({});

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
          toast.error(signUpError.message || "Failed to create account. Please try again.");
          setLoading(false);
          return;
        }

        if (data.user) {
          toast.success("Account created successfully! Welcome!");
          // Redirect to home page or show success message
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1000);
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
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
            title="Create Account"
            subtitle="Join us to access comprehensive legal education resources"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="fullName"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              disabled={loading}
            />

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
              minLength={8}
              placeholder="At least 8 characters"
              helperText="Must be at least 8 characters long"
              disabled={loading}
              error={errors.password}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
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
                  I agree to the <FormLink href="#">Terms of Service</FormLink> and{" "}
                  <FormLink href="#">Privacy Policy</FormLink>
                </>
              }
            />
            {errors.agreeToTerms && (
              <p className="text-xs text-red-600">{errors.agreeToTerms}</p>
            )}

            {/* Cloudflare Turnstile Bot Protection */}
            <div className="flex justify-center">
              <Turnstile onVerify={handleTurnstileVerify} />
            </div>

            <Button type="submit" fullWidth disabled={loading || !turnstileToken}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <Divider className="my-8" />

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <FormLink href="/auth/login">Sign in</FormLink>
            </p>
          </div>
        </FormCard>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Creating an account gives you access to our full library of legal resources
          </p>
        </div>
      </FormSection>
    </PageContainer>
  );
}
