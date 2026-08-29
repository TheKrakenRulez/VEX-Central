"use client";
import Link from "next/link";

export default function WelcomeDashboard() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#03050a] flex flex-col justify-center items-center px-6 py-4 md:py-6 relative overflow-hidden">

      {/* VISIBLE TRANSPARENT GRID PATTERN THROUGHOUT */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />

      <main className="w-full max-w-5xl z-10 flex flex-col items-center my-auto">

        {/* HERO SECTION (Larger text, moved up, spacious gap) */}
        <div className="-mt-2 mb-8 md:mb-10 text-center max-w-4xl flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-slate-300 font-bold">
              VEX Robotics Hub
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <h1 className="text-[2.8rem] md:text-[4.2rem] font-black font-mono tracking-tight text-white uppercase leading-none">
            VEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-400 to-blue-500">Central</span>
          </h1>

          <p className="text-[0.94rem] md:text-[1.17rem] text-slate-300 max-w-2xl mx-auto font-mono leading-relaxed">
            The ultimate companion platform for VEX Robotics teams
          </p>
        </div>

        {/* TILES CONTAINER (5% Less Color than original 20%, outline Red/Blue/Green, extra space at top) */}
        <div className="w-full max-w-5xl space-y-5">

          {/* TOP ROW: SIMULATOR (LEFT) & SCOUTING (RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full">

            {/* CARD 1: SIMULATOR */}
            <Link
              href="/simulator"
              className="group relative overflow-hidden bg-[#03050a]/60 border border-red-500/25 hover:border-red-500/55 rounded-2xl pt-9 px-6 pb-6 text-left shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between"
            >
              {/* Colored tint overlay */}
              <div className="absolute inset-0 bg-red-950/15 group-hover:bg-red-950/25 transition-colors rounded-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-bold font-mono uppercase text-white tracking-wide group-hover:text-red-400 transition-colors mb-1">
                  Autonomous Simulator
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed font-sans">
                  Test your robot's autonomous code. Write in a python-like script, test your code and score your autonomous routines with a simple, high-performance simulation tool.
                </p>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-red-400 tracking-wide">
                  Run Simulation
                </span>
                <span className="text-red-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* CARD 2: SCOUTING */}
            <Link
              href="/scouting"
              className="group relative overflow-hidden bg-[#03050a]/60 border border-blue-500/25 hover:border-blue-500/55 rounded-2xl pt-9 px-6 pb-6 text-left shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between"
            >
              {/* Colored tint overlay */}
              <div className="absolute inset-0 bg-blue-950/15 group-hover:bg-blue-950/25 transition-colors rounded-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-bold font-mono uppercase text-white tracking-wide group-hover:text-blue-400 transition-colors mb-1">
                  Scouting
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed font-sans">
                  Add competitions and track robot capabilities such as speed, efficiency, auton data, scoring, and more. Use our Match Scout ranking system to filter through robots and find the best alliance for you.
                </p>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-blue-400 tracking-wide">
                  Start Scouting
                </span>
                <span className="text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

          </div>

          {/* BOTTOM ROW: TEAM WORKSPACE (CENTERED BELOW) */}
          <div className="w-full max-w-2xl mx-auto">
            <Link
              href="/team"
              className="group relative overflow-hidden bg-[#03050a]/60 border border-emerald-500/25 hover:border-emerald-500/55 rounded-2xl pt-9 px-6 pb-6 text-left shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between block"
            >
              {/* Colored tint overlay */}
              <div className="absolute inset-0 bg-emerald-950/15 group-hover:bg-emerald-950/25 transition-colors rounded-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-bold font-mono uppercase text-white tracking-wide group-hover:text-emerald-400 transition-colors mb-1">
                  Team Workspace
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed font-sans">
                  Collaborate with your entire team. Share scouting data, chat in real-time, and run team polls to make critical design decisions together, keeping everyone aligned throughout the entire competition season.
                </p>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-emerald-400 tracking-wide">
                  Open Workspace
                </span>
                <span className="text-emerald-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}