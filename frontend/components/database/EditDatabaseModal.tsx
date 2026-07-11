"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { updateDatabase } from "@/services/databaseService";
import { Database, UpdateDatabaseRequest } from "@/types/database";

interface EditDatabaseModalProps {
  open: boolean;
  database: Database | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDatabaseModal({
  open,
  database,
  onClose,
  onSuccess,
}: EditDatabaseModalProps) {
  const [form, setForm] = useState<UpdateDatabaseRequest>({
    name: database?.name ?? "",
    databaseName: database?.databaseName ?? database?.name ?? "",
    dbType: database?.dbType ?? "PostgreSQL",
    host: database?.host ?? "",
    port: database?.port ?? 5432,
    username: database?.username ?? "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Re-sync whenever a different database is selected, and also whenever the
  // modal is reopened, so any unsaved/discarded draft from a previous open
  // never leaks into the next session.
  useEffect(() => {
    if (!open || !database) return;

    setForm({
      name: database.name,
      databaseName: database.databaseName ?? database.name,
      dbType: database.dbType,
      host: database.host,
      port: database.port,
      username: database.username,
      password: "",
    });
    setError("");
  }, [database, open]);

  if (!open || !database) return null;

  function handleClose() {
    if (loading) return;

    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!database || loading) return;

    setError("");
    setLoading(true);

    try {
      const payload: UpdateDatabaseRequest = { ...form };

      if (!payload.password) {
        delete payload.password;
      }

      await updateDatabase(database.id, payload);

      if (!isMountedRef.current) return;

      onSuccess();
      onClose();
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update database");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Edit Database
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

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Display Name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Database Name
            </label>

            <input
              name="databaseName"
              placeholder="Actual PostgreSQL Database Name"
              value={form.databaseName}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-xs text-slate-500">
              e.g. ai_monitoring
            </p>
          </div>

          <select
            name="dbType"
            value={form.dbType}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
          >
            <option>PostgreSQL</option>
          </select>

          <input
            name="host"
            placeholder="Host"
            value={form.host}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />

          <input
            type="number"
            name="port"
            placeholder="Port"
            value={form.port}
            onChange={handleChange}
            min={1}
            max={65535}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="New Password (leave blank to keep current)"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
          />

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-white disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-400 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}