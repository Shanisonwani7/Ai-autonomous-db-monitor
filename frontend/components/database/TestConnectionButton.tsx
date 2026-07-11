"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Plug } from "lucide-react";
import { testConnection } from "@/services/databaseService";

interface TestConnectionButtonProps {
  databaseId: number;
  onTested?: (success: boolean) => void;
}

type TestStatus = "idle" | "loading" | "success" | "error";

export default function TestConnectionButton({
  databaseId,
  onTested,
}: TestConnectionButtonProps) {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [message, setMessage] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function handleTest() {
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const result = await testConnection(databaseId);

      if (!isMountedRef.current) return;

      setStatus("success");
      setMessage(result.message || "Connection successful");
      onTested?.(true);
    } catch (err) {
      if (!isMountedRef.current) return;

      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Connection test failed");
      onTested?.(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">

      <button
        type="button"
        onClick={handleTest}
        disabled={status === "loading"}
        aria-busy={status === "loading"}
        className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "success" ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : status === "error" ? (
          <XCircle className="h-4 w-4 text-red-400" />
        ) : (
          <Plug className="h-4 w-4" />
        )}

        {status === "loading" ? "Testing..." : "Test Connection"}
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-xs ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

    </div>
  );
}