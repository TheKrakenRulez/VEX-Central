"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 py-10 px-4 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Top Grid: Info + Quick Nav + Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Description (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Image
                src="/vex-logo.png"
                alt="VEX Central Logo"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <span className="text-lg font-black font-mono tracking-wider uppercase text-white">
                VEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Central</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans">
              The ultimate companion platform for VEX V5 Robotics teams to simulate autonomous routines, scout competition matches, and collaborate in real-time.
            </p>
          </div>

          {/* Quick Navigation (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <Link href="/" className="hover:text-emerald-400 transition-colors">
                Home
              </Link>
              <Link href="/simulator" className="hover:text-red-400 transition-colors">
                Simulator
              </Link>
              <Link href="/scouting" className="hover:text-blue-400 transition-colors">
                Scouting
              </Link>
              <Link href="/team" className="hover:text-emerald-400 transition-colors">
                Team Workspace
              </Link>

              <Link href="/settings" className="hover:text-slate-200 transition-colors">
                Settings
              </Link>
            </div>
          </div>

          {/* GitHub & Tech Stack (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Project & Codebase
            </h3>
            
            {/* GitHub Direct Link for College Reviewers */}
            <a
              href="https://github.com/TheKrakenRulez/VEX-Central"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all group shadow-sm"
              title="Direct repository link for college reviewers"
            >
              <svg className="w-4 h-4 fill-current text-slate-300 group-hover:text-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Repository</span>
              <span className="text-[10px] text-emerald-400 font-bold ml-auto">↗</span>
            </a>

            {/* Subtle Tech Stack Nod */}
            <p className="text-[11px] font-mono text-slate-500">
              Built with <span className="text-slate-300">Next.js</span>, <span className="text-slate-300">Tailwind CSS</span>, and <span className="text-slate-300">Firebase</span>.
            </p>
          </div>
        </div>

        {/* Bottom Line: Copyright & Info */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <p>© 2026 VEX Central. All rights reserved.</p>
          <p className="text-[11px]">Designed for VEX V5 Robotics Competition Teams</p>
        </div>
      </div>
    </footer>
  );
}
