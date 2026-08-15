"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTeamName, setCreateTeamName] = useState("");
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const q = query(collection(db, "teams"), where("members", "array-contains", user.uid));
        const snapshot = await getDocs(q);
        const userTeams = [];
        snapshot.forEach((d) => {
          userTeams.push({ id: d.id, ...d.data() });
        });
        setTeams(userTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [user]);

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createTeamName.trim() || !user) return;
    if (user.isGuest) {
      alert("Guest preview mode: teams are not saved. Sign in to create and keep team workspaces.");
      return;
    }
    const code = generateJoinCode();
    try {
      const docRef = await addDoc(collection(db, "teams"), {
        name: createTeamName.trim(),
        joinCode: code,
        members: [user.uid],
        admins: [user.uid],
        memberDetails: {
          [user.uid]: {
            name: user.displayName || "User",
            photoURL: user.photoURL || ""
          }
        },
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      });
      router.push(`/team/${docRef.id}`);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setJoinError("");
    if (!joinCode.trim() || !user) return;
    if (user.isGuest) {
      alert("Guest preview mode: team memberships are not saved. Sign in to join and keep teams.");
      return;
    }

    try {
      const q = query(collection(db, "teams"), where("joinCode", "==", joinCode.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setJoinError("Invalid join code. Please try again.");
        return;
      }

      const teamDoc = snapshot.docs[0];
      const teamData = teamDoc.data();

      if (teamData.members.includes(user.uid)) {
        router.push(`/team/${teamDoc.id}`);
        return;
      }

      await updateDoc(doc(db, "teams", teamDoc.id), {
        members: arrayUnion(user.uid),
        [`memberDetails.${user.uid}`]: {
          name: user.displayName || "User",
          photoURL: user.photoURL || ""
        }
      });
      
      router.push(`/team/${teamDoc.id}`);
    } catch (err) {
      console.error("Error joining team:", err);
      setJoinError("An error occurred while joining the team.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse">Loading Teams...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black font-mono text-white mb-4">Team Workspace</h1>
        <p className="text-slate-400 mb-8 max-w-md">You need to sign in to access team workspaces, share scouting data, and collaborate.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black font-mono tracking-tight text-white uppercase">
            Team Workspaces
          </h1>
          <p className="text-slate-400 mt-2">Join or create a team to start collaborating.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded transition-colors"
          >
            Join Team
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded shadow-lg shadow-emerald-500/20 transition-all"
          >
            Create Team
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="text-5xl mb-6">👥</div>
          <h2 className="text-2xl font-bold font-mono text-white mb-4">No Teams Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            You aren't a member of any teams yet. Create a new team for your robotics club or ask your captain for a join code!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link 
              key={team.id}
              href={`/team/${team.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all hover:bg-slate-800/50 block group"
            >
              <div className="flex items-center gap-4 mb-4">
                {team.teamImage ? (
                  <img src={team.teamImage} alt="Team" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                    👥
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">{team.name}</h3>
                  <p className="text-slate-500 text-xs mt-1">{team.members?.length || 0} Members</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm font-mono mt-4 pt-4 border-t border-slate-800/50">
                <span className="text-slate-400">Join Code: <span className="text-white font-bold">{team.joinCode}</span></span>
                <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold font-mono text-white mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-6">
                <label className="block text-slate-400 text-sm font-mono mb-2">Team Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., VEX 3197A"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-slate-400 hover:bg-slate-800 rounded font-mono transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded font-mono transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold font-mono text-white mb-4">Join a Team</h2>
            <form onSubmit={handleJoinTeam}>
              <div className="mb-6">
                <label className="block text-slate-400 text-sm font-mono mb-2">6-Character Join Code</label>
                <input
                  type="text"
                  autoFocus
                  required
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest text-center text-xl font-bold"
                  placeholder="XXXXXX"
                />
                {joinError && <p className="text-red-400 text-sm mt-2 font-mono">{joinError}</p>}
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError("");
                    setJoinCode("");
                  }}
                  className="flex-1 py-2 text-slate-400 hover:bg-slate-800 rounded font-mono transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-200 hover:bg-white text-slate-900 font-bold py-2 rounded font-mono transition-colors"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
