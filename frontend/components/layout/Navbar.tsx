"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  Mail,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Dropdown ke bahar click karne par close ho jaye
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between shadow-lg">
      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          AI Autonomous Database Monitoring Platform
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search Box */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors"
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-cyan-400 focus:bg-slate-800 focus:ring-2 focus:ring-cyan-400/20 w-64 transition-all"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-800" />

        {/* Mail */}
        <button
          aria-label="Messages"
          className="relative p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
        >
          <Mail size={19} className="text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
        </button>

        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
        >
          <Bell size={19} className="text-slate-300" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center text-white ring-2 ring-slate-900">
            2
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-800" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/60 px-3 py-2 rounded-xl transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white shadow-md">
                S
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-white font-semibold text-sm leading-tight">
                Shani
              </p>
              <p className="text-xs text-slate-400">
                System Administrator
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-white font-semibold text-sm">Shani</p>
                <p className="text-xs text-slate-400">shani@company.com</p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">
                <User size={16} />
                My Profile
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">
                <Settings size={16} />
                Settings
              </button>

              <div className="border-t border-slate-700 my-1" />

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}