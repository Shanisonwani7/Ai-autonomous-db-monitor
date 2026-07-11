"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Database } from "@/types/database";
import TestConnectionButton from "@/components/database/TestConnectionButton";

interface DatabaseTableProps {
  databases: Database[];
  onEdit: (database: Database) => void;
  onDelete: (database: Database) => void;
  onRefresh: () => void;
}

export default function DatabaseTable({
  databases,
  onEdit,
  onDelete,
  onRefresh,
}: DatabaseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

      <table className="w-full">

        <thead className="bg-slate-800">

          <tr>
            <th scope="col" className="p-4 text-left">Database</th>
            <th scope="col" className="p-4 text-left">Type</th>
            <th scope="col" className="p-4 text-left">Host</th>
            <th scope="col" className="p-4 text-left">Status</th>
            <th scope="col" className="p-4 text-left">Health</th>
            <th scope="col" className="p-4 text-left">Actions</th>
          </tr>

        </thead>

        <tbody>

          {databases.map((db) => (

            <tr
              key={db.id}
              className="border-t border-slate-800 hover:bg-slate-800 transition"
            >

              <td className="p-4 font-medium">
                {db.name}
              </td>

              <td className="p-4">
                {db.dbType}
              </td>

              <td className="p-4">
                {db.host}:{db.port}
              </td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    db.status === "Connected"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {db.status}
                </span>

              </td>

              <td className="p-4">

                <span
                  className={`font-semibold
                  ${
                    db.healthScore >= 90
                      ? "text-green-400"
                      : db.healthScore >= 70
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {db.healthScore}%
                </span>

              </td>

              <td className="p-4">

                <div className="flex items-center gap-3">

                  <TestConnectionButton
                    databaseId={db.id}
                    onTested={onRefresh}
                  />

                  <button
                    type="button"
                    onClick={() => onEdit(db)}
                    aria-label={`Edit ${db.name}`}
                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(db)}
                    aria-label={`Delete ${db.name}`}
                    className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}