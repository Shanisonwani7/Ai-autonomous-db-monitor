"use client";

// Forgot Password Form Component

import Link from "next/link";
import { Mail, Send } from "lucide-react";

export default function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur">

      {/* Forgot Password Form */}
      <form className="space-y-6">

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email Address
          </label>

          <div className="relative">

            {/* Email Icon */}
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
            />

          </div>
        </div>

        {/* Send Reset Link Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition py-3 rounded-xl font-semibold text-white shadow-lg"
        >
          <Send size={18} />
          Send Reset Link
        </button>

        {/* Back to Login */}
        <p className="text-center text-gray-400 text-sm">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}