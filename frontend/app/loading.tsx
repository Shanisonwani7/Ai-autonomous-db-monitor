export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>

          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>

          <div className="absolute inset-3 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          </div>
        </div>

        <p className="mt-5 text-lg font-medium text-white">
          Loading AI Database Monitor...
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Preparing your monitoring workspace
        </p>
      </div>
    </div>
  );
}