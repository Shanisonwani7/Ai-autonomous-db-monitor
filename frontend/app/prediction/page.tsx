"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/layout/Navbar";
import PredictionCard from "../../components/prediction/PredictionCard";

import { Database, DatabaseZap } from "lucide-react";
import { useDatabase } from "@/context/DatabaseContext";

// Loading spinner
function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 font-medium text-lg">{label}</p>
      </div>
    </div>
  );
}

// No database yet
function NoDatabaseEmptyState() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-lg p-12 max-w-lg w-full text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
          <DatabaseZap className="w-10 h-10 text-cyan-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          No Database Connected
        </h2>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Please add your first PostgreSQL database to start AI predictions.
        </p>

        <button
          onClick={() => router.push("/database")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Database className="w-5 h-5" />
          Add Database
        </button>
      </div>
    </div>
  );
}

export default function PredictionPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const { selectedDatabaseId, loading: databaseLoading } = useDatabase();

  return (
    <div className="flex bg-slate-950">
      <Sidebar />

      <main className="ml-72 flex-1 min-h-screen">
        <Navbar />

        {databaseLoading ? (
          // Loading State: DatabaseContext still resolving
          <CenteredSpinner label="Loading Your Workspace..." />
        ) : (
          <div className="p-8">
            {selectedDatabaseId ? (
              // Prediction State: real database selected
              <PredictionCard
                databaseId={selectedDatabaseId}
                token={token}
              />
            ) : (
              // No Database State: user has no databases yet
              <NoDatabaseEmptyState />
            )}
          </div>
        )}
      </main>
    </div>
  );
}