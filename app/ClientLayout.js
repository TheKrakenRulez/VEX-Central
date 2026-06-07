"use client";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function NavBar() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

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
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <div className="text-xl font-black font-mono tracking-wider">
          <span className="text-red-500">VEX</span> <span className="text-slate-100">Central</span>
        </div>
      </Link>

      <nav className="flex items-center gap-5">
        <Link
          href="/simulator"
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-colors"
        >
          Simulator
        </Link>
        <Link
          href="/scouting"
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-blue-400 transition-colors"
        >
          Scouting
        </Link>

        {user && (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-5 ml-2">
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

            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="text-slate-500 transition-colors hover:text-slate-100"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
                <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2.15 2.15 0 0 1-3.04 3.04l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65V21a2.15 2.15 0 0 1-4.3 0v-.08a1.8 1.8 0 0 0-1.09-1.65 1.8 1.8 0 0 0-1.98.36l-.05.05a2.15 2.15 0 0 1-3.04-3.04l.05-.05A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.09H2.85a2.15 2.15 0 0 1 0-4.3h.1A1.8 1.8 0 0 0 4.6 8.52a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2.15 2.15 0 0 1 3.04-3.04l.05.05a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.35 2.2V2a2.15 2.15 0 0 1 4.3 0v.08a1.8 1.8 0 0 0 1.09 1.65 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.15 2.15 0 0 1 3.04 3.04l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.09h.1a2.15 2.15 0 0 1 0 4.3h-.1A1.8 1.8 0 0 0 19.4 15Z" />
              </svg>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
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
