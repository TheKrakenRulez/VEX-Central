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
  const [savedScripts, setSavedScripts] = useState([]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/team");
      return;
    }

    const fetchTeam = async () => {
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

  const isAdmin = (team.admins || []).includes(user.uid);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    alert("Join code copied to clipboard!");
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col p-3 md:p-4 md:py-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link href="/team" className="text-emerald-500 font-mono text-sm hover:underline mb-1 inline-block">
              ← Back to Teams
            </Link>
            <div className="flex items-center gap-3">
              {team.teamImage && (
                <img src={team.teamImage} alt="Team" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
              )}
              <h1 className="text-2xl md:text-4xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-3">
                {team.name}
              </h1>
            </div>
          </div>

          {/* Join code + manage — wraps on mobile */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 shadow-lg w-fit">
            <div className="flex items-center gap-2 pl-2">
              <span className="text-slate-500 font-mono text-xs">Code:</span>
              <span className="text-white font-mono font-bold tracking-widest bg-slate-950 px-2 py-1 rounded text-sm">{team.joinCode}</span>
              <button onClick={copyJoinCode} className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors" title="Copy Code">📋</button>
            </div>
            <div className="w-px h-5 bg-slate-800 hidden sm:block"></div>
            <div className="text-sm font-mono text-slate-400 px-2">
              👥 {team.members?.length || 0}
            </div>
            {isAdmin && (
              <>
                <div className="w-px h-5 bg-slate-800"></div>
                <button 
                  onClick={() => setShowManageModal(true)}
                  className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5"
                >
                  ⚙️ <span className="hidden sm:inline">Manage</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0" style={{ minHeight: '400px' }}>
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-0">
          <ChatBox team={team} user={user} savedScripts={savedScripts} />
        </div>
        <div className="hidden lg:flex lg:w-80">
          <PinnedResources teamId={teamId} user={user} />
        </div>
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
