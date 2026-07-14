import { useState, useEffect } from "react";
import TeamForm from "./TeamForm";
import TeamCard from "./TeamCard";
import MyTeamForm from "./MyTeamForm";
import AllianceRecommendations from "./AllianceRecommendations";

export default function CompetitionView({ competition, onBack, onUpdateTeams, userTeams = [], onUpdateSharing }) {
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [showMyTeamForm, setShowMyTeamForm] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [userTeam, setUserTeam] = useState(null);

    // Load persisted "My Team" from localStorage on component mount
    useEffect(() => {
        const savedTeam = localStorage.getItem("scouting_my_team");
        if (savedTeam) {
            try {
                setUserTeam(JSON.parse(savedTeam));
            } catch (e) {
                console.error("Failed to parse saved user team:", e);
            }
        }
    }, []);

    // Save "My Team" to localStorage when it updates
    const handleSaveMyTeam = (teamData) => {
        setUserTeam(teamData);
        localStorage.setItem("scouting_my_team", JSON.stringify(teamData));
        setShowMyTeamForm(false);
    };

    const handleClearMyTeam = () => {
        if (confirm("Are you sure you want to clear your team's stats?")) {
            setUserTeam(null);
            localStorage.removeItem("scouting_my_team");
        }
    };

    const handleAddTeam = (teamData) => {
        if (editingTeam) {
            const updatedTeams = competition.teams.map(t => t.id === editingTeam.id ? { ...teamData, id: editingTeam.id } : t);
            onUpdateTeams(updatedTeams);
        } else {
            const newTeam = {
                id: Date.now().toString(),
                ...teamData,
            };
            onUpdateTeams([...competition.teams, newTeam]);
        }
        setShowTeamForm(false);
        setEditingTeam(null);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setShowTeamForm(true);
    };

    const handleCancel = () => {
        setShowTeamForm(false);
        setEditingTeam(null);
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

                {/* Competition Info & Visibility Controls */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white uppercase mb-2">
                            {competition.name}
                        </h1>
                        <p className="text-slate-400 font-mono text-sm">
                            📅 {new Date(competition.date).toLocaleDateString()}
                        </p>
                    </div>

                    {userTeams.length > 0 && onUpdateSharing && (
                        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 font-mono text-xs self-start md:self-auto">
                            <span className="text-slate-400">Share with Team:</span>
                            <select
                                value={competition.teamId || ""}
                                onChange={(e) => onUpdateSharing(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="">Personal (Do not share)</option>
                                {userTeams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {showTeamForm ? (
                    <div className="mb-12">
                        <TeamForm
                            initialData={editingTeam}
                            onAddTeam={handleAddTeam}
                            onCancel={handleCancel}
                        />
                    </div>
                ) : showMyTeamForm ? (
                    <div className="mb-12">
                        <MyTeamForm
                            initialData={userTeam}
                            onSave={handleSaveMyTeam}
                            onCancel={() => setShowMyTeamForm(false)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Control Buttons */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <button
                                onClick={() => setShowTeamForm(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                            >
                                + Scout New Team
                            </button>
                            <button
                                onClick={() => setShowMyTeamForm(true)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                            >
                                {userTeam ? "✎ Edit My Team" : "+ Add My Team"}
                            </button>
                            {userTeam && (
                                <button
                                    onClick={handleClearMyTeam}
                                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition-colors font-mono text-xs"
                                >
                                    Clear My Team
                                </button>
                            )}
                        </div>

                        {/* My Team Spotlight */}
                        {userTeam && (
                            <div className="mb-10 bg-slate-900/30 border-2 border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black font-mono px-4 py-1 text-xs uppercase rounded-bl-lg">
                                    Our Team
                                </div>
                                <h3 className="text-xl font-bold font-mono text-white mb-4">
                                    My Team Overview (Team {userTeam.teamNumber})
                                </h3>
                                <div className="max-w-md">
                                    <TeamCard 
                                        team={userTeam} 
                                        onEdit={() => setShowMyTeamForm(true)} 
                                        onDelete={handleClearMyTeam} 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Prompt to set user team if opponent teams exist but my team is missing */}
                        {!userTeam && competition.teams.length > 0 && (
                            <div className="mb-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 text-center backdrop-blur-sm">
                                <span className="text-xl font-bold font-mono text-cyan-400 block mb-2">
                                    Alliance Match Scout Recommendations
                                </span>
                                <p className="text-slate-400 text-sm font-mono max-w-lg mx-auto mb-4">
                                    We cannot rank opponent teams or check alliance compatibility until you define your own team's stats.
                                </p>
                                <button
                                    onClick={() => setShowMyTeamForm(true)}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg font-mono text-sm"
                                >
                                    + Set My Team Stats to Compare
                                </button>
                            </div>
                        )}

                        {/* Alliance Recommendations (shows up when there is at least one scouted team that's not users) */}
                        {userTeam && competition.teams.length > 0 && (
                            <div className="mb-12">
                                <AllianceRecommendations
                                    myTeam={userTeam}
                                    allTeams={competition.teams}
                                />
                            </div>
                        )}

                        {/* Teams Grid Label */}
                        <h2 className="text-2xl font-bold font-mono text-white mb-6 uppercase tracking-wider">
                            Scouted Teams ({competition.teams.length})
                        </h2>

                        {/* Teams Grid */}
                        {competition.teams.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-12 text-center">
                                <p className="text-slate-400 font-mono mb-4">
                                    No opponent teams scouted yet
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
                                        onEdit={() => handleEditTeam(team)}
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

