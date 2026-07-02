"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back "
      subtitle="Login to access your AI Database Monitoring Platform"
    >
      <LoginForm />
    </AuthLayout>
  );
}