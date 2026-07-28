"use client";

import Link from "next/link";

// Sidebar Menu Items
const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Database Monitoring", path: "/database", icon: "🗄️" },
  { name: "Analytics", path: "/analytics", icon: "📈" },
  { name: "AI Assistant", path: "/ai", icon: "🤖" },
  { name: "Alerts", path: "/alerts", icon: "⚠️" },

  // ✅ New Prediction Page
  { name: "AI Prediction", path: "/prediction", icon: "🔮" },

  { name: "Query Optimization", path: "/query", icon: "🔍" },
  { name: "Reports", path: "/reports", icon: "📄" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col">

      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AI DB Monitor
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Autonomous Monitoring Platform
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

          <span className="text-green-400 text-sm">
            System Online
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-gray-300
              hover:bg-cyan-500/20
              hover:text-cyan-300
              transition-all
              duration-300
              mb-2
            "
          >
            <span className="text-xl">
              {item.icon}
            </span>

            <span className="font-medium">
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-5">
        <p className="text-center text-xs text-gray-500">
          AI DB Monitor v1.0
        </p>
      </div>

    </aside>
  );
}