"use client";
import Link from "next/link";

export default function WelcomeDashboard() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6 relative overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <main className="w-full max-w-5xl text-center z-10 flex flex-col items-center">

        {/* HERO SECTION */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              VEX Robotics Hub
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tight text-white uppercase leading-none">
            VEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Central</span>
          </h1>

          <p className="text-md md:text-lg text-slate-400 max-w-xl mx-auto mt-6 font-mono leading-relaxed">
            The ultimate companion platform for VEX Robotics teams.
          </p>
        </div>

        {/* INTERACTIVE NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4 max-w-4xl">

          {/* CARD 1: SIMULATOR */}
          <Link
            href="/simulator"
            className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-3xl p-8 text-left shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            {/* Hover card border glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-300" />

            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-xl text-red-400 font-mono font-bold shadow-inner">
                🕹️
              </div>
              <span className="text-slate-600 group-hover:text-red-400 font-bold transition-colors">➔</span>
            </div>

            <h2 className="text-xl font-bold font-mono uppercase text-white tracking-wide group-hover:text-red-400 transition-colors">
              Autonomous Simulator
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed font-sans">
              Test your robot's autonomous code. Write in a python-like script, test your code and score your autonomous routines with a simple, high-performance simulation tool.

            </p>

            <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center gap-2">
              <span className="text-[10px] font-mono text-red-400 uppercase font-black tracking-wider">
                Run Simulation
              </span>
              <span className="text-slate-500 text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* CARD 2: SCOUTING */}
          <Link
            href="/scouting"
            className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 text-left shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            {/* Hover card border glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />

            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-xl text-blue-400 font-mono font-bold shadow-inner">
                📊
              </div>
              <span className="text-slate-600 group-hover:text-blue-400 font-bold transition-colors">➔</span>
            </div>

            <h2 className="text-xl font-bold font-mono uppercase text-white tracking-wide group-hover:text-blue-400 transition-colors">
              Scouting
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed font-sans">
              Add competitions, scout teams, and track each robot's capabilities. Record speed, efficiency, autonomous data, scoring metrics, and more.


            </p>

            <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center gap-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-black tracking-wider">
                Start Scouting
              </span>
              <span className="text-slate-500 text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

        </div>

      </main>
    </div>
  );
}