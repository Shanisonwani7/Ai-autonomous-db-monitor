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
  setSelectedDatabaseId: (id: number) => void;
  loading: boolean;
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

  useEffect(() => {
    async function loadDatabases() {
      try {
        const data = await getDatabases();

        setDatabases(data);

        if (data.length > 0) {
          setSelectedDatabaseId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load databases:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDatabases();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        databases,
        selectedDatabaseId,
        setSelectedDatabaseId,
        loading,
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