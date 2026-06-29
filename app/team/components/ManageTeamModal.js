"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ManageTeamModal({ team, user, onClose, onUpdate }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(team.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateName = async () => {
    if (!teamName.trim() || teamName === team.name) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "teams", team.id), { name: teamName.trim() });
      onUpdate({ ...team, name: teamName.trim() });
    } catch (err) {
      console.error(err);
      setError("Failed to update name.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400; // smaller for team avatar
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        try {
          await updateDoc(doc(db, "teams", team.id), { teamImage: compressedBase64 });
          onUpdate({ ...team, teamImage: compressedBase64 });
        } catch (err) {
          console.error(err);
          setError("Failed to upload image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePromote = async (memberId) => {
    try {
      const newAdmins = [...(team.admins || []), memberId];
      await updateDoc(doc(db, "teams", team.id), { admins: newAdmins });
      onUpdate({ ...team, admins: newAdmins });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemote = async (memberId) => {
    if ((team.admins || []).length <= 1) {
      setError("Cannot demote the last admin.");
      return;
    }
    try {
      const newAdmins = (team.admins || []).filter(id => id !== memberId);
      await updateDoc(doc(db, "teams", team.id), { admins: newAdmins });
      onUpdate({ ...team, admins: newAdmins });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if ((team.members || []).length === 1 && memberId === user.uid) {
      // Last member deleting themselves deletes the team
      if (confirm("You are the last member. Leaving will permanently delete this team. Are you sure?")) {
        await deleteDoc(doc(db, "teams", team.id));
        router.push("/team");
      }
      return;
    }

    if (memberId === user.uid && !confirm("Are you sure you want to leave this team?")) return;
    if (memberId !== user.uid && !confirm("Are you sure you want to remove this member?")) return;

    try {
      const newMembers = (team.members || []).filter(id => id !== memberId);
      const newAdmins = (team.admins || []).filter(id => id !== memberId);
      
      const newDetails = { ...team.memberDetails };
      delete newDetails[memberId];

      await updateDoc(doc(db, "teams", team.id), {
        members: newMembers,
        admins: newAdmins,
        memberDetails: newDetails
      });

      if (memberId === user.uid) {
        router.push("/team"); // User left
      } else {
        onUpdate({ ...team, members: newMembers, admins: newAdmins, memberDetails: newDetails });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    alert("Join code copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 rounded-t-xl z-10">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            ⚙️ Manage Team
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>
        
        <div className="p-6 space-y-8">
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {/* General Settings */}
          <section className="space-y-4">
            <h3 className="text-emerald-500 font-mono font-bold uppercase tracking-wider text-sm border-b border-slate-800 pb-2">General Settings</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative group shrink-0">
                {team.teamImage ? (
                  <img src={team.teamImage} alt="Team" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-700" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl">👥</div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer text-xs font-bold text-white uppercase tracking-wider">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Team Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <button 
                      onClick={handleUpdateName}
                      disabled={loading || teamName === team.name}
                      className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded text-sm transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Join Code</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-emerald-400 font-bold font-mono tracking-widest text-center">
                      {team.joinCode}
                    </div>
                    <button 
                      onClick={copyJoinCode}
                      className="px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-sm transition-colors"
                      title="Copy to Clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Members List */}
          <section className="space-y-4">
            <h3 className="text-emerald-500 font-mono font-bold uppercase tracking-wider text-sm border-b border-slate-800 pb-2">Members ({team.members?.length || 0})</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {(team.members || []).map((memberId) => {
                const isMe = memberId === user.uid;
                const isAdmin = (team.admins || []).includes(memberId);
                const details = team.memberDetails?.[memberId] || { name: "Unknown User", photoURL: "" };

                return (
                  <div key={memberId} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {details.photoURL ? (
                        <img src={details.photoURL} alt="avatar" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                          {details.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-bold text-sm flex items-center gap-2">
                          {details.name} {isMe && <span className="text-emerald-500 text-[10px] uppercase font-mono">(You)</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{isAdmin ? "👑 Admin" : "Member"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isAdmin ? (
                        <button onClick={() => handlePromote(memberId)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors" title="Make Admin">⬆ Promote</button>
                      ) : (
                        <button onClick={() => handleDemote(memberId)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded transition-colors" title="Remove Admin">⬇ Demote</button>
                      )}
                      <button onClick={() => handleRemoveMember(memberId)} className="px-2 py-1 bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-xs rounded transition-colors" title={isMe ? "Leave Team" : "Remove from Team"}>
                        {isMe ? "Leave" : "Kick"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
