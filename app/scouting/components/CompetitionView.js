import { useState } from "react";
import TeamForm from "./TeamForm";
import TeamCard from "./TeamCard";

export default function CompetitionView({ competition, onBack, onUpdateTeams }) {
    const [showTeamForm, setShowTeamForm] = useState(false);

    const handleAddTeam = (teamData) => {
        const newTeam = {
            id: Date.now().toString(),
            ...teamData,
        };
        onUpdateTeams([...competition.teams, newTeam]);
        setShowTeamForm(false);
    };

    const handleDeleteTeam = (teamId) => {
        onUpdateTeams(competition.teams.filter((t) => t.id !== teamId));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
            {/* Background Ambient Glows */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="mb-6 text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                    ← Back to Competitions
                </button>

                {/* Competition Info */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white uppercase mb-2">
                        {competition.name}
                    </h1>
                    <p className="text-slate-400 font-mono text-sm">
                        📅 {new Date(competition.date).toLocaleDateString()}
                    </p>
                </div>

                {showTeamForm ? (
                    <div className="mb-12">
                        <TeamForm
                            onAddTeam={handleAddTeam}
                            onCancel={() => setShowTeamForm(false)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Add Team Button */}
                        <button
                            onClick={() => setShowTeamForm(true)}
                            className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            + Add Team
                        </button>

                        {/* Teams Grid */}
                        {competition.teams.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-12 text-center">
                                <p className="text-slate-400 font-mono mb-4">
                                    No teams scouted yet
                                </p>
                                <button
                                    onClick={() => setShowTeamForm(true)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
                                >
                                    Scout your first team →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {competition.teams.map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        onDelete={() => handleDeleteTeam(team.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
