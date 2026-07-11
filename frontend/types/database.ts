export interface Database {
  id: number;

  // Display Name
  name: string;

  // Actual PostgreSQL Database Name
  databaseName?: string;

  dbType: string;
  host: string;
  port: number;
  username: string;

  status: string;
  databaseSize: string;
  activeConnections: number;
  uptime: string;
  databaseVersion: string;
  healthScore: number;
  lastCheck: string;
  createdAt: string;
}

export interface AddDatabaseRequest {
  // Display Name
  name: string;

  // Actual PostgreSQL Database Name
  databaseName?: string;

  dbType: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface UpdateDatabaseRequest {
  name?: string;
  databaseName?: string;

  dbType?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface DatabaseResponse {
  success: boolean;
  message?: string;
  database?: Database;
}

export interface DatabaseListResponse {
  success: boolean;
  databases: Database[];
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  database?: Database;
}