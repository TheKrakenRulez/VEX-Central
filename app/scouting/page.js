"use client";
import { useState, useEffect } from "react";
import CompetitionForm from "./components/CompetitionForm";
import CompetitionView from "./components/CompetitionView";

export default function ScoutingPage() {
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Load competitions from localStorage
    useEffect(() => {
        const savedCompetitions = localStorage.getItem("vex_competitions");
        if (savedCompetitions) {
            try {
                setCompetitions(JSON.parse(savedCompetitions));
            } catch (error) {
                console.error("Error loading competitions:", error);
            }
        }
    }, []);

    // Save competitions to localStorage (excluding images)
    useEffect(() => {
        const competitionsToSave = competitions.map((comp) => ({
            ...comp,
            teams: comp.teams.map((team) => {
                const { robotImagePreview, ...teamWithoutImage } = team;
                return teamWithoutImage;
            }),
        }));
        localStorage.setItem("vex_competitions", JSON.stringify(competitionsToSave));
    }, [competitions]);

    const handleCreateCompetition = (newCompetition) => {
        const id = Date.now().toString();
        setCompetitions([
            ...competitions,
            {
                id,
                name: newCompetition.name,
                date: newCompetition.date,
                teams: [],
            },
        ]);
        setShowForm(false);
    };

    const handleDeleteCompetition = (id) => {
        setCompetitions(competitions.filter((c) => c.id !== id));
        if (selectedCompetitionId === id) {
            setSelectedCompetitionId(null);
        }
    };

    const handleUpdateTeams = (competitionId, teams) => {
        setCompetitions(
            competitions.map((c) =>
                c.id === competitionId ? { ...c, teams } : c
            )
        );
    };

    const selectedCompetition = competitions.find(
        (c) => c.id === selectedCompetitionId
    );

    if (selectedCompetition) {
        return (
            <CompetitionView
                competition={selectedCompetition}
                onBack={() => setSelectedCompetitionId(null)}
                onUpdateTeams={(teams) =>
                    handleUpdateTeams(selectedCompetitionId, teams)
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
                        <CompetitionForm onCreateCompetition={handleCreateCompetition} />
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
                                                <p className="text-slate-400 text-sm font-mono mt-1">
                                                    📅 {new Date(competition.date).toLocaleDateString()}
                                                </p>
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
