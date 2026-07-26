"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/layout/Navbar";
import RecentAlerts from "@/components/alerts/RecentAlerts";

export default function AlertsPage() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || ""
      : "";

  // Abhi same database use kar rahe hain
  const databaseId = 12;

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />

      <main className="ml-72 flex-1 min-h-screen text-white">
        <Navbar />

        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
              Alerts Center
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Monitor all AI-generated database alerts in one place.
            </p>
          </div>

          <RecentAlerts
            data={{
              name: "Production DB Test",
              healthScore: 100,
              deadlocks: 0,
              activeConnections: 0,
              cacheHitRatio: 100,
              status: "Connected",
              lastCheck: new Date().toISOString(),
            }}
            databaseId={databaseId}
            token={token}
          />
        </div>
      </main>
    </div>
  );
}