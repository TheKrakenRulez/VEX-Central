"use client";
import { useState, useEffect } from "react";

const formatCompetitionDate = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
import CompetitionForm from "./components/CompetitionForm";
import CompetitionView from "./components/CompetitionView";
import { useAuth } from "@/context/AuthContext";
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ScoutingPage() {
    const { user } = useAuth();
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const [userTeams, setUserTeams] = useState([]);

    // Load competitions from Firestore or localStorage
    useEffect(() => {
        if (user === undefined) return;
        const load = async () => {
            if (user && db) {
                try {
                    // Fetch user's teams
                    const tq = query(collection(db, "teams"), where("members", "array-contains", user.uid));
                    const teamSnap = await getDocs(tq);
                    const teamsList = [];
                    teamSnap.forEach(d => teamsList.push({ id: d.id, ...d.data() }));
                    setUserTeams(teamsList);
                    const teamIds = teamsList.map(t => t.id);

                    // Fetch competitions
                    const loaded = new Map();
                    const q1 = query(collection(db, "competitions"), where("userId", "==", user.uid));
                    const snap1 = await getDocs(q1);
                    snap1.forEach(d => loaded.set(d.id, { id: d.id, ...d.data() }));

                    if (teamIds.length > 0) {
                        const q2 = query(collection(db, "competitions"), where("teamId", "in", teamIds));
                        const snap2 = await getDocs(q2);
                        snap2.forEach(d => loaded.set(d.id, { id: d.id, ...d.data() }));
                    }

                    setCompetitions(Array.from(loaded.values()));
                } catch (err) {
                    console.error("Error loading competitions:", err);
                }
            } else {
                const saved = localStorage.getItem("vex_competitions");
                if (saved) {
                    try {
                        setCompetitions(JSON.parse(saved));
                    } catch (error) {
                        console.error("Error loading competitions:", error);
                    }
                }
            }
            setIsLoaded(true);
        };
        load();
    }, [user]);

    // Save competitions to localStorage for guest users
    useEffect(() => {
        if (!isLoaded || user) return;
        localStorage.setItem("vex_competitions", JSON.stringify(competitions));
    }, [competitions, user, isLoaded]);

    const handleCreateCompetition = async (newCompetition) => {
        const id = Date.now().toString();
        const newComp = {
            id,
            name: newCompetition.name,
            date: newCompetition.date,
            gameMode: newCompetition.gameMode || "push_back",
            teamId: newCompetition.teamId || null,
            teams: [],
        };
        if (!newComp.teamId) delete newComp.teamId;

        setCompetitions([...competitions, newComp]);
        setShowForm(false);
        if (user && db) {
            try {
                await setDoc(doc(db, "competitions", id), { ...newComp, userId: user.uid });
            } catch (err) {
                console.error("Error saving competition:", err);
            }
        }
    };

    const handleDeleteCompetition = async (id) => {
        if (!confirm("Are you sure you want to delete this competition? This action cannot be undone.")) return;
        setCompetitions(competitions.filter((c) => c.id !== id));
        if (selectedCompetitionId === id) {
            setSelectedCompetitionId(null);
        }
        if (user && db) {
            try {
                await deleteDoc(doc(db, "competitions", id));
            } catch (err) {
                console.error("Error deleting competition:", err);
            }
        }
    };

    const handleUpdateTeams = async (competitionId, teams) => {
        const comp = competitions.find(c => c.id === competitionId);
        if (!comp) return;
        const updatedComp = { ...comp, teams };

        setCompetitions(
            competitions.map((c) =>
                c.id === competitionId ? updatedComp : c
            )
        );

        if (user && db) {
            const compToSave = {
                ...updatedComp,
                userId: user.uid,
            };
            try {
                await setDoc(doc(db, "competitions", competitionId), compToSave);
            } catch (err) {
                console.error("Error updating teams:", err);
            }
        }
    };

    const handleUpdateSharing = async (competitionId, teamId) => {
        const comp = competitions.find(c => c.id === competitionId);
        if (!comp) return;

        const updatedComp = { ...comp };
        if (teamId) {
            updatedComp.teamId = teamId;
        } else {
            delete updatedComp.teamId;
        }

        setCompetitions(
            competitions.map((c) =>
                c.id === competitionId ? updatedComp : c
            )
        );

        if (user && db) {
            try {
                const compToSave = {
                    ...updatedComp,
                    userId: user.uid,
                };
                if (!teamId) {
                    delete compToSave.teamId;
                }
                await setDoc(doc(db, "competitions", competitionId), compToSave);

                // Send chat message if shared with a team
                if (teamId) {
                    await addDoc(collection(db, "team_messages"), {
                        teamId: teamId,
                        senderId: user.uid,
                        senderName: user.displayName || "User",
                        text: `Hey team! I just shared the scouting data for the "${updatedComp.name}" competition.`,
                        link: "/scouting",
                        createdAt: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error("Error updating sharing team:", err);
            }
        }
    };

    const selectedCompetition = competitions.find(
        (c) => c.id === selectedCompetitionId
    );

    if (selectedCompetition) {
        return (
            <CompetitionView
                competition={selectedCompetition}
                onBack={() => setSelectedCompetitionId(null)}
                userTeams={userTeams}
                onUpdateTeams={(teams) =>
                    handleUpdateTeams(selectedCompetitionId, teams)
                }
                onUpdateSharing={(teamId) =>
                    handleUpdateSharing(selectedCompetitionId, teamId)
                }
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
            {/* Background Ambient Glows */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white uppercase mb-2">
                        Scouting
                    </h1>
                    <p className="text-slate-400 font-mono text-sm">
                        Create competitions and scout VEX teams
                    </p>
                </div>

                {/* Main Content */}
                {showForm ? (
                    <div className="mb-12">
                        <button
                            onClick={() => setShowForm(false)}
                            className="mb-6 text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                        >
                            ← Back to Competitions
                        </button>
                        <CompetitionForm onCreateCompetition={handleCreateCompetition} userTeams={userTeams} />
                    </div>
                ) : (
                    <>
                        {/* Create Button */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            + New Competition
                        </button>

                        {/* Competitions List */}
                        {competitions.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-12 text-center">
                                <p className="text-slate-400 font-mono mb-4">
                                    No competitions yet
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
                                >
                                    Create your first competition →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {competitions.map((competition) => (
                                    <div
                                        key={competition.id}
                                        className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-lg p-6 transition-all hover:shadow-lg cursor-pointer group"
                                        onClick={() => setSelectedCompetitionId(competition.id)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold font-mono text-white group-hover:text-blue-400 transition-colors">
                                                    {competition.name}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-slate-400 text-sm font-mono">
                                                        📅 {formatCompetitionDate(competition.date)}
                                                    </p>
                                                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider ${competition.gameMode === "override"
                                                            ? "bg-purple-900/50 border border-purple-500/40 text-purple-400"
                                                            : "bg-orange-900/50 border border-orange-500/40 text-orange-400"
                                                        }`}>
                                                        {competition.gameMode === "override" ? "Override" : "Push Back"}
                                                    </span>
                                                    {competition.teamId && (
                                                        <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                                            Team Shared
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                                            <span className="text-sm text-slate-400 font-mono">
                                                Teams: {competition.teams.length}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCompetition(competition.id);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
