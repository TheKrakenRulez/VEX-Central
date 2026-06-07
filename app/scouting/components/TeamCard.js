import { useState } from "react";

export default function TeamCard({ team, onDelete }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-lg overflow-hidden transition-all hover:shadow-lg">
            {/* Card Header */}
            <div
                className="p-6 border-b border-slate-700 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold font-mono text-white">
                            Team {team.teamNumber}
                        </h3>
                        <p className="text-slate-400 text-sm font-mono mt-1">
                            {team.primaryStrategy || "—"} • {team.drivetrainSpeed || "—"}
                        </p>
                    </div>
                    <span className="text-slate-500">{showDetails ? "▼" : "▶"}</span>
                </div>
            </div>

            {/* Robot Image */}
            {team.robotImagePreview && (
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/20">
                    <img
                        src={team.robotImagePreview}
                        alt={`Team ${team.teamNumber} robot`}
                        className="w-full h-40 object-contain rounded"
                    />
                </div>
            )}

            {/* Expandable Details */}
            {showDetails && (
                <div className="px-6 py-4 space-y-3 bg-slate-800/20">
                    {/* Drivetrain */}
                    {team.drivetrainSpeed && (
                        <div className="pb-3 border-b border-slate-700">
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">
                                Drivetrain
                            </p>
                            <p className="text-sm text-white capitalize font-mono">
                                {team.drivetrainSpeed}
                            </p>
                        </div>
                    )}

                    {/* Autonomy */}
                    {team.hasAuton && (
                        <div className="pb-3 border-b border-slate-700">
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">
                                Auton
                            </p>
                            <p className="text-sm text-white capitalize font-mono">
                                {team.hasAuton === "yes" ? "Yes" : "No"}
                            </p>
                            {team.hasAuton === "yes" && (
                                <>
                                    {team.autonConsistency && (
                                        <p className="text-sm text-slate-400 mt-2 font-mono">
                                            Consistency: <span className="text-white">{team.autonConsistency}%</span>
                                        </p>
                                    )}
                                    {team.autonPoints && (
                                        <p className="text-sm text-slate-400 font-mono">
                                            Points: <span className="text-white">{team.autonPoints}</span>
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Strategy */}
                    {team.primaryStrategy && (
                        <div className="pb-3 border-b border-slate-700">
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">
                                Primary Strategy
                            </p>
                            <p className="text-sm text-white capitalize font-mono">
                                {team.primaryStrategy}
                            </p>
                        </div>
                    )}

                    {/* Scoring */}
                    {team.scoringSpeed && (
                        <div className="pb-3 border-b border-slate-700">
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">
                                Scoring Speed
                            </p>
                            <p className="text-sm text-white capitalize font-mono">
                                {team.scoringSpeed}
                            </p>
                        </div>
                    )}

                    {/* Capabilities */}
                    {(team.deScoring || team.singleParking || team.doubleParking) && (
                        <div className="pb-3 border-b border-slate-700">
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-2">
                                Capabilities
                            </p>
                            <div className="space-y-1 text-sm font-mono">
                                {team.deScoring && (
                                    <p className="text-slate-300">
                                        De-Scoring:{" "}
                                        <span className={team.deScoring === "yes" ? "text-green-400" : "text-red-400"}>
                                            {team.deScoring === "yes" ? "✓ Yes" : "✗ No"}
                                        </span>
                                    </p>
                                )}
                                {team.singleParking && (
                                    <p className="text-slate-300">
                                        Single Parking:{" "}
                                        <span className={team.singleParking === "yes" ? "text-green-400" : "text-red-400"}>
                                            {team.singleParking === "yes" ? "✓ Yes" : "✗ No"}
                                        </span>
                                    </p>
                                )}
                                {team.doubleParking && (
                                    <p className="text-slate-300">
                                        Double Parking:{" "}
                                        <span className={team.doubleParking === "yes" ? "text-green-400" : "text-red-400"}>
                                            {team.doubleParking === "yes" ? "✓ Yes" : "✗ No"}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delete Button */}
                    <div className="pt-2">
                        <button
                            onClick={onDelete}
                            className="w-full px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-sm font-bold rounded transition-colors"
                        >
                            Delete Team
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Stats Footer */}
            {!showDetails && (
                <div className="px-6 py-3 bg-slate-800/20 text-xs text-slate-400 font-mono flex justify-between">
                    <span>Click to expand →</span>
                    <span>{team.hasAuton === "yes" ? "Auton ✓" : team.hasAuton === "no" ? "No Auton" : "—"}</span>
                </div>
            )}
        </div>
    );
}
