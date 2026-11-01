"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ChatBox from "../components/ChatBox";
import ManageTeamModal from "../components/ManageTeamModal";
import PinnedResources from "../components/PinnedResources";

export default function TeamWorkspacePage({ params }) {
  const { teamId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showPinnedResources, setShowPinnedResources] = useState(false);
  const [savedScripts, setSavedScripts] = useState([]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/team");
      return;
    }

    const fetchTeam = async () => {
      if (user.isGuest) {
        try {
          const savedTeams = sessionStorage.getItem("vex_guest_teams");
          const guestTeams = savedTeams ? JSON.parse(savedTeams) : [];
          const guestTeam = guestTeams.find((candidate) => candidate.id === teamId);
          if (guestTeam) {
            setTeam(guestTeam);
          } else {
            router.push("/team");
          }
        } catch (error) {
          console.error("Error loading guest workspace:", error);
          router.push("/team");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const docRef = doc(db, "teams", teamId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.members.includes(user.uid)) {
            setTeam({ id: docSnap.id, ...data });
          } else {
            router.push("/team"); // Not a member
          }
        } else {
          router.push("/team"); // Doesn't exist
        }
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();

    if (user.isGuest) {
      return;
    }

    // Fetch user's saved scripts
    const fetchScripts = async () => {
      try {
        const q = query(
          collection(db, "scripts"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const scripts = [];
        querySnapshot.forEach((doc) => {
          scripts.push({ id: doc.id, ...doc.data() });
        });
        setSavedScripts(scripts);
      } catch (err) {
        console.error("Error fetching scripts:", err);
      }
    };
    fetchScripts();
  }, [user, teamId, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse">Loading Workspace...</div>
      </div>
    );
  }

  if (!team) return null;

  const isAdmin = (team.admins || []).includes(user.uid) || team.createdBy === user.uid;

  return (
    <div className="mx-auto flex h-[calc(100dvh-80px)] w-full max-w-6xl flex-col overflow-hidden p-4 md:p-8">
      <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:mb-6 md:flex-row md:items-end">
        <div>
          <Link href="/team" className="text-emerald-500 font-mono text-sm hover:underline mb-2 inline-block">
            ← Back to Teams
          </Link>
          <div className="flex items-center gap-4">
            {team.teamImage && (
              <img src={team.teamImage} alt="Team" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
            )}
            <h1 className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-3">
              {team.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-lg p-1.5 shadow-lg">
          <div className="text-sm font-mono text-slate-400 px-3">
            👥 {team.members?.length || 0}
          </div>
          <button
            type="button"
            data-tour="workspace-pinned-toggle"
            aria-expanded={showPinnedResources}
            onClick={() => setShowPinnedResources((shown) => !shown)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
              showPinnedResources
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"
            }`}
          >
            📌 {showPinnedResources ? "Hide Pinned Resources" : "Pinned Resources"}
          </button>
          {isAdmin && !user.isGuest && (
            <>
              <div className="w-px h-6 bg-slate-800"></div>
              <button 
                onClick={() => setShowManageModal(true)}
                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-md font-mono text-sm transition-colors flex items-center gap-2"
              >
                ⚙️ Manage
              </button>
            </>
          )}
        </div>
      </div>

      {user.isGuest && (
        <p data-tour="workspace-guest-note" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Temporary guest workspace. It will be deleted when you leave guest mode; sign in to keep it.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl">
          <ChatBox team={team} user={user} savedScripts={savedScripts} />
        </div>
        {showPinnedResources && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <button
              type="button"
              aria-label="Close pinned resources"
              onClick={() => setShowPinnedResources(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <aside
              aria-label="Pinned resources"
              className="relative z-10 h-full w-full max-w-sm overflow-y-auto border-l border-slate-800 bg-slate-900 p-4 shadow-2xl"
            >
              <PinnedResources
                teamId={teamId}
                user={user}
                onClose={() => setShowPinnedResources(false)}
              />
            </aside>
          </div>
        )}
      </div>

      {showManageModal && (
        <ManageTeamModal 
          team={team} 
          user={user} 
          onClose={() => setShowManageModal(false)}
          onUpdate={(updatedTeam) => setTeam(updatedTeam)}
        />
      )}
    </div>
  );
}
