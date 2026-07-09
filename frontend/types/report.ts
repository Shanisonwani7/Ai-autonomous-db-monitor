export interface ReportResponse {
  success: boolean;
  generatedAt: string;
  report: {
    database: {
      id: number;
      name: string;
      version: string;
      size: string;
      activeConnections: number;
    };
    monitoring: {
      runningQueries: number;
      idleSessions: number;
      slowQueries: number;
      longTransactions: number;
      locks: number;
    };
    statistics: {
      commits: number;
      rollbacks: number;
      deadlocks: number;
    };
  };
}