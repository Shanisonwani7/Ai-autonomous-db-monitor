"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Edit, Trash2 } from "lucide-react";

import { User } from "@/types/user";
import { getUsers } from "@/services/userService";

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users once on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // Filter by name or email; recomputes only when users/search change
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, search]);

  const handleEdit = (id: number) => {
    console.log("Edit User:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete User:", id);
  };

  if (loading) {
    return <div className="text-center text-white py-10">Loading Users...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 text-gray-400">Name</th>
              <th className="text-left py-4 text-gray-400">Email</th>
              <th className="text-left py-4 text-gray-400">Role</th>
              <th className="text-left py-4 text-gray-400">Status</th>
              <th className="text-center py-4 text-gray-400">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Empty state — shown when search matches nothing (was missing before) */}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}

            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition"
              >
                {/* Name + avatar initial */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">Joined {user.joinedDate}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 text-gray-300">{user.email}</td>

                {/* Role badge */}
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "Administrator"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Status badge */}
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                {/* Edit / Delete actions */}
                <td className="py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                    >
                      <Edit size={18} className="text-white" />
                    </button>

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
                    >
                      <Trash2 size={18} className="text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total count reflects the filtered list, not the full user list */}
      <div className="mt-6 text-right text-sm text-gray-400">
        Total Users: <span className="text-cyan-400 font-semibold">{filteredUsers.length}</span>
      </div>
    </div>
  );
}