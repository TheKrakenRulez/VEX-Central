"use client";
import ProfileForm from "@/app/components/ProfileForm";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const { profile, saveProfile } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (profileData) => {
    saveProfile(profileData);
    setSuccessMessage("Profile updated.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
              Account
            </p>
            <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
              Settings
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Update your profile information for VEX Central.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-white"
          >
            Back Home
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white">
              Profile
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              These fields can be changed anytime.
            </p>
          </div>

          <ProfileForm
            initialProfile={profile ?? {}}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
          />

          {successMessage && (
            <p className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-xs font-mono text-green-300">
              {successMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
