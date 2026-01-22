"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/instance";
import PageContainer from "@/compounents/PageContainer";
import FormSection from "@/compounents/FormSection";
import FormCard from "@/compounents/FormCard";
import FormHeader from "@/compounents/FormHeader";
import Input from "@/compounents/Input";
import Checkbox from "@/compounents/Checkbox";
import Button from "@/compounents/Button";
import Divider from "@/compounents/Divider";
import FormLink from "@/compounents/FormLink";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

            <Button type="submit" fullWidth disabled={loading}>
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
