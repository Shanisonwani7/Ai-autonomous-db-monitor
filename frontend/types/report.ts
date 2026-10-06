export interface TrendMetric {
  first: number;
  latest: number;
  min: number;
  max: number;
  average: number;
  absoluteChange: number;
  percentChange: number;
  trend: string;
}

export interface MetricTrends {
  healthScore: string;
  connections: string;
  slowQueries: string;
  locks: string;
  cacheHitRatio: string;
}

export interface AIInsights {
  overallTrend: string;
  healthSummary: string;
  metricTrends: MetricTrends;
  concerns: string[];
  recommendedActions: string[];
}

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

    historicalAnalysis: {
      recordCount: number;
      earliestTimestamp: string | null;
      latestTimestamp: string | null;

      metrics: {
        healthScore: TrendMetric;
        activeConnections: TrendMetric;
        slowQueries: TrendMetric;
        locks: TrendMetric;
        cacheHitRatio: TrendMetric;
      };
    };

    aiInsights: AIInsights;
  };
}