export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400">
        AI-Powered Autonomous Database Monitoring Platform
      </h1>

      <p className="text-gray-400 mt-2">
        Real-Time Monitoring | AI Analysis | Database Optimization
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-gray-400">Database Status</h2>
          <p className="text-3xl text-green-400 font-bold mt-3">
            Healthy
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-gray-400">CPU Usage</h2>
          <p className="text-3xl text-yellow-400 font-bold mt-3">
            25%
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-gray-400">Memory Usage</h2>
          <p className="text-3xl text-blue-400 font-bold mt-3">
            48%
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-gray-400">Active Connections</h2>
          <p className="text-3xl text-pink-400 font-bold mt-3">
            128
          </p>
        </div>

      </div>

      <div className="mt-10 bg-gray-900 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-cyan-400">
          AI Recommendation
        </h2>

        <p className="mt-4 text-gray-300">
          No critical issues detected.
        </p>

        <p className="text-gray-400 mt-2">
          Database performance is stable.
        </p>
      </div>
    </main>
  );
}