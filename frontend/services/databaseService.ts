import {
  Database,
  DatabaseResponse,
  TestConnectionResponse,
  AddDatabaseRequest,
  UpdateDatabaseRequest,
} from "@/types/database";

const API_URL = "http://localhost:5000/api/database";

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ==============================
// Get All Databases
// ==============================
export async function getDatabases(): Promise<Database[]> {
  console.log("========== DATABASE REQUEST ==========");
  console.log("TOKEN:", getToken());

  const response = await fetch(`${API_URL}/list`, {
    method: "GET",
    headers: getHeaders(),
  });

  console.log("STATUS:", response.status);

  const data = await response.json();

  console.log("RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch databases");
  }

  return data as Database[];
}

// ==============================
// Add Database
// ==============================
export async function addDatabase(
  database: AddDatabaseRequest
): Promise<DatabaseResponse> {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(database),
  });

  const data: DatabaseResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add database");
  }

  return data;
}

// ==============================
// Update Database
// ==============================
export async function updateDatabase(
  id: number,
  database: UpdateDatabaseRequest
): Promise<DatabaseResponse> {
  const response = await fetch(`${API_URL}/update/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(database),
  });

  const data: DatabaseResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update database");
  }

  return data;
}

// ==============================
// Delete Database
// ==============================
export async function deleteDatabase(
  id: number
): Promise<DatabaseResponse> {
  const response = await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data: DatabaseResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete database");
  }

  return data;
}

// ==============================
// Test Database Connection
// ==============================
export async function testConnection(
  id: number
): Promise<TestConnectionResponse> {
  const response = await fetch(`${API_URL}/test/${id}`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data: TestConnectionResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Connection test failed");
  }

  return data;
}
