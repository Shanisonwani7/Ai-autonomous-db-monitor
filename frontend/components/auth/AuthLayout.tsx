interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 p-14">
          <h1 className="text-5xl font-bold text-white">
            AI DB Monitor
          </h1>

          <p className="text-slate-200 mt-6 text-lg leading-8">
            Autonomous Database Monitoring Platform powered by AI,
            Analytics, Health Score, Alerts and Optimization.
          </p>

          <div className="mt-10 space-y-4 text-slate-100">
            <p>✔ Real-Time Monitoring</p>
            <p>✔ AI Health Analysis</p>
            <p>✔ Query Optimization</p>
            <p>✔ Predictive Alerts</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-slate-900 flex items-center justify-center p-10">

          <div className="w-full max-w-md">

            <h2 className="text-3xl font-bold text-white">
              {title}
            </h2>

            <p className="text-slate-400 mt-2 mb-8">
              {subtitle}
            </p>

            {children}

          </div>

        </div>

      </div>
    </div>
  );
}