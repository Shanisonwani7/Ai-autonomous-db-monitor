"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-white/[0.03] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          Something Went Wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          An unexpected error occurred while loading this
          page. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}