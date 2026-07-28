"use client";

import { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/layout/Navbar";
import PredictionCard from "../../components/prediction/PredictionCard";

export default function PredictionPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div className="flex bg-slate-950">
      <Sidebar />

      <main className="ml-72 flex-1 min-h-screen">
        <Navbar />

        <div className="p-8">
          <PredictionCard
            databaseId={12}
            token={token}
          />
        </div>
      </main>
    </div>
  );
}