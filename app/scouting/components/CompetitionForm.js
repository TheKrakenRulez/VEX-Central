import { useState } from "react";

export default function CompetitionForm({ onCreateCompetition, userTeams = [] }) {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [teamId, setTeamId] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Competition name is required");
            return;
        }
        if (!date) {
            setError("Date is required");
            return;
        }

        const data = { name, date };
        if (teamId) {
            data.teamId = teamId;
        }

        onCreateCompetition(data);
        setName("");
        setDate("");
        setTeamId("");
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold font-mono text-white mb-6">
                Create Competition
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-mono text-slate-300 mb-2">
                        Competition Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., State Championship"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-mono text-slate-300 mb-2">
                        Competition Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {userTeams.length > 0 && (
                    <div>
                        <label className="block text-sm font-mono text-slate-300 mb-2">
                            Share with Team (Optional)
                        </label>
                        <select
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="">Personal (Do not share)</option>
                            {userTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded px-4 py-2 text-red-300 text-sm font-mono">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors mt-6"
                >
                    Create Competition
                </button>
            </form>
        </div>
    );
}
