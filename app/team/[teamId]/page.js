"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ChatBox from "../components/ChatBox";
import ManageTeamModal from "../components/ManageTeamModal";

export default function TeamWorkspacePage({ params }) {
  const { teamId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

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
    <div className="min-h-[calc(100vh-80px)] flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
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
          <div className="flex items-center gap-2 pl-3">
            <span className="text-slate-500 font-mono text-xs">Join Code:</span>
            <span className="text-white font-mono font-bold tracking-widest bg-slate-950 px-2 py-1 rounded">{team.joinCode}</span>
            <button onClick={copyJoinCode} className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors" title="Copy Code">📋</button>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="text-sm font-mono text-slate-400 px-3">
            👥 {team.members?.length || 0}
          </div>
          {isAdmin && (
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

      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
        <ChatBox team={team} user={user} />
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
