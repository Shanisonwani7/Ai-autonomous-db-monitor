"use client";

import { Server, CheckCircle2, XCircle } from "lucide-react";

interface DatabaseStatusProps {
  data: {
    name: string;
    type: string;
    host: string;
    port: number;
    status: string;
    version: string;
    uptime: string;
    databaseSize: string;
    activeConnections: number;
    cacheHitRatio: number;
    lastCheck: string;
  } | null;
}

export default function DatabaseStatus({ data }: DatabaseStatusProps) {
  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full min-h-[400px] flex items-center justify-center hover:border-cyan-500/30 transition">
        <p className="text-gray-400 animate-pulse font-medium">Loading database information...</p>
      </div>
    );
  }

  const isConnected = data.status === "Connected";

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{data.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {data.type} • {data.version}
            </p>
          </div>
        </div>
        
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${
            isConnected
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {isConnected ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {data.status}
        </div>
      </div>

      <div className="space-y-2 flex-1 mt-2">
        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Host</span>
          <span className="text-white text-sm">{data.host}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Port</span>
          <span className="text-white text-sm">{data.port}</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Uptime</span>
          <span className="text-white text-sm">{data.uptime || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Database Size</span>
          <span className="text-white text-sm">{data.databaseSize || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Connections</span>
          <span className="text-white text-sm">{data.activeConnections}</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Cache Hit Ratio</span>
          <span className="text-white text-sm">{data.cacheHitRatio}%</span>
        </div>

        <div className="flex justify-between items-center py-3 group hover:bg-slate-800/20 rounded-lg px-2 transition-colors">
          <span className="text-gray-400 text-sm font-medium">Last Check</span>
          <span className="text-white text-sm">
            {data.lastCheck ? new Date(data.lastCheck).toLocaleString() : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}