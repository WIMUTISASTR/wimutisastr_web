"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", formData);
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
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              rightElement={
                <Link
                  href="#"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Forgot password?
                </Link>
              }
            />

            <Checkbox
              id="remember"
              name="remember"
              label="Remember me"
            />

            <Button type="submit" fullWidth>
              Sign In
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
