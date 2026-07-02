"use client";

// User Management Page

import UsersTable from "@/components/users/UsersTable";

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">

      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-white mb-2">
        User Management
      </h1>

      {/* Page Description */}
      <p className="text-gray-400 mb-8">
        Manage all registered users of AI Database Monitoring Platform.
      </p>

      {/* Users Table */}
      <UsersTable />

    </div>
  );
}