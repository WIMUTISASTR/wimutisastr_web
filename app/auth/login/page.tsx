"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/compounents/PageContainer";
import FormSection from "@/compounents/FormSection";
import FormCard from "@/compounents/FormCard";
import FormHeader from "@/compounents/FormHeader";
import Input from "@/compounents/Input";
import Checkbox from "@/compounents/Checkbox";
import Button from "@/compounents/Button";
import Divider from "@/compounents/Divider";
import FormLink from "@/compounents/FormLink";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err) {
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
                  className="text-sm text-[var(--brown-strong)] hover:text-[var(--brown)] font-medium"
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

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Divider className="my-8" />

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
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
