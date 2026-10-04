import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* VISIBLE TRANSPARENT GRID PATTERN THROUGHOUT */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />

      {/* 404 Content (No Container Box) */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-7 max-w-xl mx-auto">
        
        {/* Large Solid 404 Display */}
        <h1 className="text-9xl md:text-[11rem] font-black font-mono tracking-tight text-white select-none leading-none">
          404
        </h1>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-black font-mono text-white tracking-tight">
            Autonomous Route Not Found
          </h2>
          <p className="text-slate-300 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-sans">
            Looks like your robot went off the field! The page you requested could not be found.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center font-mono text-sm md:text-base font-bold">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-blue-500 text-white hover:opacity-95 transition-all shadow-xl shadow-blue-500/10 text-center font-bold tracking-wide"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
