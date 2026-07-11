"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { addDatabase } from "@/services/databaseService";
import { AddDatabaseRequest } from "@/types/database";

interface AddDatabaseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Local extension of AddDatabaseRequest to include the new databaseName
// field until it's added to the shared type in @/types/database.
type AddDatabaseFormState = AddDatabaseRequest & {
  databaseName: string;
};

const initialForm: AddDatabaseFormState = {
  name: "",
  databaseName: "",
  dbType: "PostgreSQL",
  host: "localhost",
  port: 5432,
  username: "",
  password: "",
};

export default function AddDatabaseModal({
  open,
  onClose,
  onSuccess,
}: AddDatabaseModalProps) {
  const [form, setForm] = useState<AddDatabaseFormState>(initialForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!open) return null;

  function resetAndClose() {
    if (loading) return;

    setForm(initialForm);
    setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await addDatabase(form);

      if (!isMountedRef.current) return;

      setForm(initialForm);
      onSuccess();
      onClose();
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add database");
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
            Add Database
          </h2>

          <button
            onClick={resetAndClose}
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
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={resetAndClose}
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
              {loading ? "Adding..." : "Add Database"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}