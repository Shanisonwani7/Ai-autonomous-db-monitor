"use client";

import { useEffect, useRef, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { deleteDatabase } from "@/services/databaseService";
import { Database } from "@/types/database";

interface DeleteDatabaseModalProps {
  open: boolean;
  database: Database | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteDatabaseModal({
  open,
  database,
  onClose,
  onSuccess,
}: DeleteDatabaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Clear any error left over from a previous delete attempt whenever the
  // modal is opened again, whether for the same database or a different one.
  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open, database]);

  if (!open || !database) return null;

  function handleClose() {
    if (loading) return;

    onClose();
  }

  async function handleDelete() {
    if (!database || loading) return;

    setError("");
    setLoading(true);

    try {
      await deleteDatabase(database.id);

      if (!isMountedRef.current) return;

      onSuccess();
      onClose();
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete database");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Delete Database
          </h2>

          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
            className="disabled:opacity-60"
          >
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{database.name}</span>?
            This action cannot be undone.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-red-400 text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-white disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}