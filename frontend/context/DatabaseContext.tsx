"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Database } from "@/types/database";
import { getDatabases } from "@/services/databaseService";

interface DatabaseContextType {
  databases: Database[];
  selectedDatabaseId: number | null;
  setSelectedDatabaseId: (id: number | null) => void;
  loading: boolean;
  refreshDatabases: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export function DatabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] =
    useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshDatabases() {
    try {
      setLoading(true);

      const data = await getDatabases();
      console.log("DATABASE LIST:", data);
      setDatabases(data);

    if (data.length > 0) {
  setSelectedDatabaseId((current) => {
    console.log("CURRENT DATABASE:", current);
    console.log("FIRST DATABASE:", data[0]);

    if (
      current &&
      data.some((db) => db.id === current)
    ) {
      return current;
    }

    return data[0].id;
  });
} else {
  setSelectedDatabaseId(null);
}
    } catch (error) {
      console.error("Failed to load databases:", error);
      setDatabases([]);
      setSelectedDatabaseId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDatabases();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        databases,
        selectedDatabaseId,
        setSelectedDatabaseId,
        loading,
        refreshDatabases,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error(
      "useDatabase must be used inside DatabaseProvider"
    );
  }

  return context;
}