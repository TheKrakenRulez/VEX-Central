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

    const init = async () => {
      if (!user || user.isGuest || teamId.startsWith("guest-")) {
        const local = localStorage.getItem("guest_teams");
        const teams = local ? JSON.parse(local) : [];
        const found = teams.find((t) => t.id === teamId);
        if (found) {
          setTeam(found);
        } else {
          setTeam({
            id: teamId,
            name: "Guest Team Workspace",
            joinCode: "GUEST1",
            members: ["guest"],
            admins: ["guest"],
            createdBy: "guest",
          });
        }
        setLoading(false);
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

      // Fetch user's saved scripts
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

    init();
  }, [user, teamId, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse">Loading Workspace...</div>
      </div>
    );
  }

  if (!team) return null;

  const isGuestMode = !user || user.isGuest || team.id.startsWith("guest-");
  const isAdmin = isGuestMode || (team.admins || []).includes(user?.uid);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    alert("Join code copied to clipboard!");
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col p-2 md:p-4 max-w-6xl mx-auto w-full overflow-hidden">
      {/* Guest Mode Warning Banner */}
      {isGuestMode && (
        <div className="flex-shrink-0 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 md:p-2.5 text-amber-300 font-mono text-[11px] md:text-xs text-center mb-2">
          ⚠️ Reminder: You are in Guest Preview Mode. Teams and workspace messages will not be saved permanently unless you sign in.
        </div>
      )}

      {/* Permanently Fixed Top Header Bar */}
      <div className="flex-shrink-0 bg-slate-900 border border-slate-800 rounded-t-2xl p-3 md:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shadow-lg z-20">
        {/* Left: Back button + Avatar + Team Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/team" className="text-emerald-400 font-mono text-xs md:text-sm hover:underline flex-shrink-0 font-bold flex items-center gap-1">
            ← <span className="hidden sm:inline">Back to Teams</span><span className="sm:hidden">Teams</span>
          </Link>
          <div className="w-px h-5 bg-slate-800 flex-shrink-0" />
          {team.teamImage && (
            <img src={team.teamImage} alt="Team" className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0" />
          )}
          <h1 className="text-base md:text-xl font-black font-mono tracking-tight text-white uppercase truncate">
            {team.name}
          </h1>
        </div>

        {/* Right: Permanent action bar (Code, Copy, Members, Pinned Resources, Manage) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 flex-shrink-0">
            <span className="text-slate-500 font-mono text-xs">Code:</span>
            <span className="text-white font-mono font-bold tracking-widest text-xs">{team.joinCode}</span>
            <button onClick={copyJoinCode} className="text-slate-400 hover:text-white px-1 transition-colors text-xs" title="Copy Join Code">📋</button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex-shrink-0" title="Team Members">
            👥 {team.members?.length || 0}
          </div>

          <button
            onClick={() => setShowPinnedResources(true)}
            className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap shadow-sm"
            title="View Pinned Resources"
          >
            📌 <span className="hidden sm:inline">Pinned Resources</span><span className="sm:hidden">Pinned</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => setShowManageModal(true)}
              className="bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white px-2 py-1 sm:px-2.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
              title="Manage Team Settings"
            >
              ⚙️ <span className="hidden sm:inline">Manage</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Chat Container */}
      <div className="flex-1 bg-slate-900/50 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden flex flex-col shadow-2xl min-h-0">
        <ChatBox team={team} user={user} savedScripts={savedScripts} />
      </div>

      {/* Pinned Resources Drawer Modal */}
      {showPinnedResources && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-4 flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                📌 Pinned Resources
              </h2>
              <button
                onClick={() => setShowPinnedResources(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PinnedResources teamId={teamId} user={user} />
            </div>
          </div>
        </div>
      )}

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
