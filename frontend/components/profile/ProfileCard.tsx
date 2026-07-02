"use client";

// User Profile Card

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  KeyRound,
  LogOut,
} from "lucide-react";

import { UserProfile } from "@/types/user";
import { getUserProfile } from "@/services/userService";

export default function ProfileCard() {
      // User Data
  const [user, setUser] = useState<UserProfile | null>(null);

  // Loading State
  const [loading, setLoading] = useState(true);

  // Error State
  const [error, setError] = useState("");

  // Router
  const router = useRouter();
  // Edit Profile
  const handleEditProfile = () => {
    console.log("Edit Profile");
  };

  // Change Password
  const handleChangePassword = () => {
  console.log("Change Password");
  };

  // Logout
  const handleLogout = () => {
    console.log("Logout");
  };
  // Fetch User Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);
    // Loading UI
  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading Profile...
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="text-red-500 text-center py-20">
        {error}
      </div>
    );
  }

  if (!user) return null;
  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

      {/* Profile Header */}
      <div className="flex flex-col items-center">

        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">

           {user.avatar ? (
             <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
             />
            ) : (
                <User
                 size={60}
                 className="text-white"
                />
            )}

        </div>

        {/* Name */}
        <h2 className="mt-6 text-3xl font-bold text-white">
          {user.name}
        </h2>

        {/* Role */}
        <p className="text-cyan-400 text-lg">
          {user.role}
        </p>

      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 my-8"></div>

      {/* User Information */}
      <div className="space-y-6">

        {/* Email */}
        <div className="flex items-center gap-4">
          <Mail className="text-cyan-400" />
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-4">
          <Shield className="text-cyan-400" />
          <div>
            <p className="text-gray-400 text-sm">Role</p>
            <p className="text-white">{user.role}</p>
          </div>
        </div>

        {/* Joined */}
        <div className="flex items-center gap-4">
          <Calendar className="text-cyan-400" />
          <div>
            <p className="text-gray-400 text-sm">Joined</p>
            <p className="text-white">{user.joinedDate}</p>
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 my-8"></div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <button
            onClick={handleEditProfile}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl transition"
        >
             <Edit size={18} />
             Edit Profile
        </button>

        <button
            onClick={handleChangePassword}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition"
        >
            <KeyRound size={18} />   
            Change Password
        </button>

        <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl transition"
       >
            <LogOut size={18} />
            Logout
        </button>

      </div>

    </div>
  );
}