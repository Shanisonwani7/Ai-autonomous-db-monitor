
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";

export default function LoginForm() {
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Next.js Router
  const router = useRouter();

  // Controlled inputs — needed so we can validate before submit
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UX states: shows spinner on the button + disables it while a request is in flight
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level errors, keyed by field name, so each input can show its own message
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  // Simple client-side validation before we ever hit the network
  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {

    // Login API
    const data = await login(email, password);

    console.log("LOGIN RESPONSE:", data);

    // Save JWT Token
    localStorage.setItem("token", data.token);

    console.log("TOKEN AFTER SAVE:", localStorage.getItem("token"));

    // Redirect Dashboard
    router.push("/dashboard");

    } catch (err) {

    if (err instanceof Error) {
    setErrors({
      form: err.message,
    });
    } else {
    setErrors({
      form: "Something went wrong.",
    });
  }

} finally {
  setIsSubmitting(false);
}
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/30 backdrop-blur">
    
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Form-level error banner (e.g. failed login attempt) */}
        {errors.form && (
          <div
            role="alert"
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} className="shrink-0" />
            {errors.form}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full bg-slate-800 border rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none transition
                ${errors.email
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-700 focus:border-cyan-400"
                }`}
            />
          </div>

          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full bg-slate-800 border rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-gray-500 outline-none transition
                ${errors.password
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-700 focus:border-cyan-400"
                }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
            <input type="checkbox" className="accent-cyan-500 w-4 h-4" />
            Remember Me
          </label>

          <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-sm transition">
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition py-3 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Login
            </>
          )}
        </button>

        {/* Register */}
        <p className="text-center text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}