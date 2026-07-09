"use client";

import { useState } from "react";
import { downloadReport } from "@/services/reportService";

interface DownloadButtonProps {
  databaseId: number;
}

export default function DownloadButton({
  databaseId,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);

      await downloadReport(databaseId);
    } catch (error) {
      console.error(error);
      alert("Failed to download report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white px-5 py-3 rounded-xl font-semibold transition"
    >
      {loading ? "Downloading..." : "📥 Download PDF"}
    </button>
  );
}