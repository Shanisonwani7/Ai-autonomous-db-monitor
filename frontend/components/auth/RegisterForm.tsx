"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/authService";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  // Toggle visibility for each password field independently
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Register User
  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();

   setError("");

   if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    const data = await register(
      name,
      email,
      password
    );

    alert(data.message);

    router.push("/login");

  } catch (err) {

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Something went wrong.");
    }

  } finally {
    setLoading(false);
  }
  };
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur">
      <form
         className="space-y-6"
         onSubmit={handleSubmit}
      >
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
           {error}
          </div>
        )}
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Enter your full name"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Enter your email"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
                required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2">
          <input id="terms" type="checkbox" required className="mt-1 accent-cyan-500" />

          <label htmlFor="terms" className="text-sm text-gray-300">
            I agree to the{" "}
            <span className="text-cyan-400 cursor-pointer hover:underline">
              Terms & Conditions
            </span>
          </label>
        </div>

        {/* Register Button — single submit button, was duplicated before */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition py-3 rounded-xl font-semibold text-white shadow-lg"
        >
        {loading ? (
           "Creating..."
        ) : (
          <>
           <UserPlus size={18} />
            Create Account
          </>
        )}
        </button>

        {/* Login link — kept only once, was repeated 3 times before */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}