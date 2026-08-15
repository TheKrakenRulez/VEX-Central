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
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <Image
          src="/vex-logo.png"
          alt="VEX Logo"
          width={56}
          height={56}
          className="w-13 h-13"
        />
        <div className="text-xl font-black font-mono tracking-wider uppercase">
          VEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Central</span>
        </div>
      </Link>

      <nav className="flex items-center gap-5">
        {isGuest && (
          <div className="px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200">
            Guest View — not saved
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
              {/* User avatar */}
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

              {/* Display name */}
              <span className="text-xs font-mono text-slate-300 hidden md:block">
                {profile?.preferredName || profile?.name || user.displayName?.split(" ")[0] || "User"}
              </span>

              <span className="text-[10px] text-slate-500 ml-1">▼</span>
            </button>

            {/* Dropdown Menu */}
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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
