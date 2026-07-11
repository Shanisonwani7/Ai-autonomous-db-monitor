"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Database } from "@/types/database";
import { getDatabases } from "@/services/databaseService";

import DatabaseTable from "@/components/database/DatabaseTable";
import AddDatabaseModal from "@/components/database/AddDatabaseModal";
import EditDatabaseModal from "@/components/database/EditDatabaseModal";
import DeleteDatabaseModal from "@/components/database/DeleteDatabaseModal";

export default function DatabasePage() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(
    null
  );

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // `silent` refreshes (after Add/Edit/Delete/Test) keep the existing table
  // on screen instead of swapping the whole page to a loading/error state.
  async function loadDatabases(options?: { silent?: boolean }) {
    try {
      if (!options?.silent) {
        setLoading(true);
      }

      setError("");

      const data = await getDatabases();

      if (!isMountedRef.current) return;

      setDatabases(data);
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load databases");
      }
    } finally {
      if (isMountedRef.current && !options?.silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEdit(database: Database) {
    setSelectedDatabase(database);
    setShowEditModal(true);
  }

  function handleDelete(database: Database) {
    setSelectedDatabase(database);
    setShowDeleteModal(true);
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    setSelectedDatabase(null);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setSelectedDatabase(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading databases...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Database Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all your monitored PostgreSQL databases.
          </p>

        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
        >
          <Plus size={18} />
          Add Database
        </button>

      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {databases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
          <h2 className="mb-2 text-2xl font-semibold">
            No Databases Found
          </h2>

          <p className="text-slate-400">
            Add your first database to start monitoring.
          </p>
        </div>
      ) : (
        <DatabaseTable
          databases={databases}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={() => loadDatabases({ silent: true })}
        />
      )}

      <AddDatabaseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => loadDatabases({ silent: true })}
      />

      <EditDatabaseModal
        open={showEditModal}
        database={selectedDatabase}
        onClose={handleCloseEditModal}
        onSuccess={() => loadDatabases({ silent: true })}
      />

      <DeleteDatabaseModal
        open={showDeleteModal}
        database={selectedDatabase}
        onClose={handleCloseDeleteModal}
        onSuccess={() => loadDatabases({ silent: true })}
      />

    </div>
  );
}