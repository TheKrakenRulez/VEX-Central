"use client";
import ProfileForm from "@/app/components/ProfileForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user, saveProfile } = useAuth();
  const router = useRouter();

  const handleSubmit = async (profileData) => {
    saveProfile(profileData);
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-6 py-12">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-20 pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
              Account Setup
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>

        <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black font-mono uppercase tracking-tight text-white">
              Complete Your Profile
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Tell us a little about yourself so VEX Central can personalize your workspace.
            </p>
          </div>

          <ProfileForm
            initialProfile={{
              preferredName: user?.displayName?.split(" ")[0] ?? "",
              dateOfBirth: "",
              organization: "",
            }}
            submitLabel="Finish Setup"
            onSubmit={handleSubmit}
          />
        </section>
      </main>
    </div>
  );
}
