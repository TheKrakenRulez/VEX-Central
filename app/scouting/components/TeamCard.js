import { useState } from "react";

export default function TeamCard({ team, onEdit, onDelete }) {
    const [showDetails, setShowDetails] = useState(false);
    const isOverride = team.gameMode === "override";

    return (
        <div className={`bg-slate-900/50 border hover:border-blue-500/50 rounded-lg overflow-hidden transition-all hover:shadow-lg ${isOverride ? "border-purple-500/30" : "border-slate-800"
            }`}>
            {/* Card Header */}
            <div
                className="p-6 border-b border-slate-700 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold font-mono text-white">
                                Team {team.teamNumber}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider ${isOverride
                                    ? "bg-purple-900/50 border border-purple-500/40 text-purple-400"
                                    : "bg-orange-900/50 border border-orange-500/40 text-orange-400"
                                }`}>
                                {isOverride ? "Override" : "Push Back"}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-mono mt-2 flex items-center gap-3">
                            <span>{team.primaryStrategy || "—"}</span>
                            <span className="text-slate-600">•</span>
                            <span>{team.drivetrainSpeed || "—"}</span>
                            <span className="text-slate-600">•</span>
                            <span className={team.hasAuton === "yes" ? "text-emerald-400" : "text-slate-500"}>
                                {team.hasAuton === "yes" ? "Auton ✓" : "No Auton"}
                            </span>
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

                    {isOverride ? (
                        /* ===== OVERRIDE DETAILS ===== */
                        <>
                            {/* Block & Cup Scoring */}
                            {(team.blockScoringSpeed || team.cupScoringSpeed) && (
                                <div className="pb-3 border-b border-slate-700">
                                    <p className="text-xs font-mono text-purple-400 uppercase tracking-wide mb-2">
                                        Scoring Speeds
                                    </p>
                                    <div className="space-y-1 text-sm font-mono">
                                        {team.blockScoringSpeed && (
                                            <p className="text-slate-300">
                                                Block Scoring:{" "}
                                                <span className="text-white capitalize font-bold">{team.blockScoringSpeed}</span>
                                            </p>
                                        )}
                                        {team.cupScoringSpeed && (
                                            <p className="text-slate-300">
                                                Cup Scoring:{" "}
                                                <span className="text-white capitalize font-bold">{team.cupScoringSpeed}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Override Capabilities */}
                            {(team.canFlipBlocks || team.canFlipCups || team.hasToggleAbility) && (
                                <div className="pb-3 border-b border-slate-700">
                                    <p className="text-xs font-mono text-purple-400 uppercase tracking-wide mb-2">
                                        Override Capabilities
                                    </p>
                                    <div className="space-y-1 text-sm font-mono">
                                        {team.canFlipBlocks && (
                                            <p className="text-slate-300">
                                                Flip Blocks:{" "}
                                                <span className={team.canFlipBlocks === "yes" ? "text-green-400" : "text-red-400"}>
                                                    {team.canFlipBlocks === "yes" ? "✓ Yes" : "✗ No"}
                                                </span>
                                            </p>
                                        )}
                                        {team.canFlipCups && (
                                            <p className="text-slate-300">
                                                Flip Cups:{" "}
                                                <span className={team.canFlipCups === "yes" ? "text-green-400" : "text-red-400"}>
                                                    {team.canFlipCups === "yes" ? "✓ Yes" : "✗ No"}
                                                </span>
                                            </p>
                                        )}
                                        {team.hasToggleAbility && (
                                            <p className="text-slate-300">
                                                Toggle Ability:{" "}
                                                <span className={team.hasToggleAbility === "yes" ? "text-green-400" : "text-red-400"}>
                                                    {team.hasToggleAbility === "yes" ? "✓ Yes" : "✗ No"}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ===== PUSH BACK DETAILS ===== */
                        <>
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
                                        {team.hasMatchloaderIntake && (
                                            <p className="text-slate-300">
                                                Matchloader Intake:{" "}
                                                <span className={team.hasMatchloaderIntake === "yes" ? "text-green-400" : "text-red-400"}>
                                                    {team.hasMatchloaderIntake === "yes" ? `✓ Yes (${team.matchloaderSpeed || "average"})` : "✗ No"}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Edit and Delete Buttons */}
                    <div className="pt-2 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="flex-1 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 text-sm font-bold rounded transition-colors"
                        >
                            Edit Team
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this team?")) {
                                    onDelete();
                                }
                            }}
                            className="flex-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-sm font-bold rounded transition-colors"
                        >
                            Delete Team
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
