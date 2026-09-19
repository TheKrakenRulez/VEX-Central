"use client";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

function NavBar() {
  const { user, profile, logout, isGuest } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image
            src="/vex-logo.png"
            alt="VEX Logo"
            width={56}
            height={56}
            className="w-10 h-10 md:w-13 md:h-13"
          />
          <div className="text-lg md:text-xl font-black font-mono tracking-wider uppercase">
            VEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Central</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          {isGuest && (
            <div className="px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200">
              Guest View
            </div>
          )}

          <Link
            href="/simulator"
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-colors"
          >
            Simulator
          </Link>

          <p>|</p>

          <Link
            href="/scouting"
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-blue-400 transition-colors"
          >
            Scouting
          </Link>

          <p>|</p>

          <Link
          href="/team"
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-blue-400 transition-colors"
          >
            Team Workspace
          </Link>
          
          {user && (
            <div className="relative flex items-center border-l border-slate-800 pl-5 ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {user.photoURL ? (
                  <div
                    aria-label={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border-2 border-slate-700 bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.photoURL})` }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-200">
                    {user.displayName?.[0] ?? "U"}
                  </div>
                )}
                <span className="text-xs font-mono text-slate-300 hidden md:block">
                  {profile?.preferredName || profile?.name || user.displayName?.split(" ")[0] || "User"}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden py-1 z-50">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile right side: guest badge + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {isGuest && (
            <div className="px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-200">
              Guest
            </div>
          )}
          {user && (
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-200 overflow-hidden flex-shrink-0">
              {user.photoURL
                ? <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${user.photoURL})` }} />
                : user.displayName?.[0] ?? "U"
              }
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-1">
          <Link
            href="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            Simulator
          </Link>
          <Link
            href="/scouting"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-blue-400 transition-colors"
          >
            Scouting
          </Link>
          <Link
            href="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
          >
            Team Workspace
          </Link>
          {user && (
            <>
              <div className="h-px bg-slate-800 my-1" />
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center px-3 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-red-400 hover:bg-slate-800 transition-colors text-left"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function AuthGuard({ children }) {
  const { user, profile, isAuthLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublicRoute = pathname === "/login";
    const isOnboardingRoute = pathname === "/onboarding";

    if (isAuthLoading) {
      return;
    }

    if (user === null && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && !profile && !isOnboardingRoute) {
      router.replace("/onboarding");
      return;
    }

    if (user && profile && isOnboardingRoute) {
      router.replace("/");
    }
  }, [user, profile, isAuthLoading, pathname, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0b132b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Loading VEX Central...</p>
        </div>
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  if (!profile) {
    return null;
  }

  if (user && profile) {
    return (
      <>
        <NavBar />
        <div className="flex-1">{children}</div>
      </>
    );
  }

  return null;
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
