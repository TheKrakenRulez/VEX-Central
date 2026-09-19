"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";

export default function PinnedResources({ teamId, user }) {
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const fetchTeamNotes = async () => {
      if (teamId.startsWith("guest-")) {
        const savedNotes = localStorage.getItem("guest_pinned_notes_" + teamId);
        setNotes(savedNotes || "");
        return;
      }
      try {
        const docRef = doc(db, "teams", teamId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotes(docSnap.data().pinnedNotes || "");
        }
      } catch (err) {
        console.error("Error fetching team notes:", err);
      }
    };
    fetchTeamNotes();
  }, [teamId]);

  const handleSaveNotes = async () => {
    if (!teamId) return;
    setSaving(true);
    try {
      if (teamId.startsWith("guest-")) {
        localStorage.setItem("guest_pinned_notes_" + teamId, notes);
        setEditing(false);
        return;
      }
      const docRef = doc(db, "teams", teamId);
      await updateDoc(docRef, { pinnedNotes: notes });
      setEditing(false);
    } catch (err) {
      console.error("Error saving pinned notes:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
          📌 Pinned Resources
        </h3>
      </div>

      {/* Quick Launch Simulator */}
      <Link
        href="/simulator"
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <span>🤖</span> Open Simulator
      </Link>

      {/* Strategy Notes Section */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">Team Strategy & Notes</span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              ✏️ Edit
            </button>
          ) : (
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="text-[11px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {editing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write team strategy notes, autonomous routine ideas, or goal priorities here..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
          />
        ) : (
          <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap min-h-[60px] italic">
            {notes ? notes : "No team notes pinned yet. Click Edit to add strategy notes!"}
          </p>
        )}
      </div>

      {/* Quick Helpful Links */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono font-semibold text-slate-400">Useful Links</span>
        <div className="flex flex-col gap-1.5 font-mono text-xs">
          <a
            href="https://www.vexrobotics.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-emerald-400 bg-slate-950/40 border border-slate-800/60 rounded-lg px-3 py-2 flex items-center justify-between transition-colors"
          >
            <span>🌐 VEX Official Site</span>
            <span className="text-slate-600 text-[10px]">↗</span>
          </a>
          <Link
            href="/team"
            className="text-slate-300 hover:text-emerald-400 bg-slate-950/40 border border-slate-800/60 rounded-lg px-3 py-2 flex items-center justify-between transition-colors"
          >
            <span>👥 Team Hub</span>
            <span className="text-slate-600 text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
