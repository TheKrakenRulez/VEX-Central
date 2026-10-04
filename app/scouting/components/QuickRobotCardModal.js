"use client";

import { useState } from "react";

export default function QuickRobotCardModal({ team, onClose, onEdit }) {
  if (!team) return null;

  const isOverride = team.gameMode === "override";
  const autonPoints = parseInt(team.autonPoints || 0, 10);
  const autonConsistency = parseInt(team.autonConsistency || 0, 10);
  
  // Calculated estimated win-loss record from consistency and capabilities if not explicitly provided
  const wins = team.wins !== undefined ? team.wins : Math.round((autonConsistency / 100) * 10);
  const losses = team.losses !== undefined ? team.losses : Math.max(0, 10 - wins - (team.ties || 0));
  const ties = team.ties || 0;
  const totalMatches = wins + losses + ties || 10;
  const winRate = Math.round((wins / totalMatches) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Modal Header Banner */}
        <div className={`p-6 border-b flex items-start justify-between relative overflow-hidden ${
          isOverride 
            ? "bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-purple-500/30" 
            : "bg-gradient-to-r from-orange-950/80 via-slate-900 to-slate-900 border-orange-500/30"
        }`}>
          <div className="flex items-center gap-4 z-10">
            {/* Robot Image / Generated Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
              {team.robotImagePreview ? (
                <img src={team.robotImagePreview} alt={`Robot ${team.teamNumber}`} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <span className="text-2xl block">🤖</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{team.teamNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  isOverride 
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" 
                    : "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                }`}>
                  {isOverride ? "26-27 Override" : "25-26 Push Back"}
                </span>
                <span className="text-xs text-slate-400">Scouted Profile</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Team {team.teamNumber}
              </h2>
              <p className="text-xs text-slate-300">
                {team.teamName || `VEX Team ${team.teamNumber}`} • {team.location || "VEX Robotics Competition"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10"
          >
            ✕
          </button>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Win-Loss Record */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Record</span>
              <span className="text-base md:text-lg font-black text-emerald-400 block">{wins}W-{losses}L-{ties}T</span>
              <span className="text-[10px] text-emerald-500/90 font-bold block">{winRate}% Win Rate</span>
            </div>

            {/* Avg Auton Score */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Avg Auton</span>
              <span className="text-base md:text-lg font-black text-blue-400 block">{autonPoints} pts</span>
              <span className="text-[10px] text-blue-400/90 font-bold block">{autonConsistency}% Reliability</span>
            </div>

            {/* Strategy / Drivetrain */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Speed</span>
              <span className="text-base md:text-lg font-black text-amber-400 block capitalize truncate">{team.drivetrainSpeed || "Fast"}</span>
              <span className="text-[10px] text-slate-400 truncate block">{team.primaryStrategy || "Scorer"}</span>
            </div>
          </div>

          {/* Detailed Capabilities & Specs */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              ⚙️ Robot Capabilities & Hardware
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Autonomous Routine:</span>
                <span className={`font-bold ${team.hasAuton === "yes" ? "text-emerald-400" : "text-slate-400"}`}>
                  {team.hasAuton === "yes" ? `✓ Yes (${autonPoints} pts, ${autonConsistency}%)` : "✗ None"}
                </span>
              </div>
              
              <div>
                <span className="text-slate-500 block">Primary Role:</span>
                <span className="font-bold text-white capitalize">{team.primaryStrategy || "Offensive Scorer"}</span>
              </div>

              {isOverride ? (
                <>
                  <div>
                    <span className="text-slate-500 block">Block Scoring:</span>
                    <span className="font-bold text-purple-300 capitalize">{team.blockScoringSpeed || "Average"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cup Scoring:</span>
                    <span className="font-bold text-purple-300 capitalize">{team.cupScoringSpeed || "Average"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Flip Blocks / Cups:</span>
                    <span className="font-bold text-slate-200">
                      Blocks: {team.canFlipBlocks === "yes" ? "✓" : "✗"} • Cups: {team.canFlipCups === "yes" ? "✓" : "✗"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Toggle Ability:</span>
                    <span className={`font-bold ${team.hasToggleAbility === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                      {team.hasToggleAbility === "yes" ? "✓ Supported" : "✗ No"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500 block">Scoring Speed:</span>
                    <span className="font-bold text-orange-300 capitalize">{team.scoringSpeed || "Fast"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">De-Scoring Ability:</span>
                    <span className={`font-bold ${team.deScoring === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                      {team.deScoring === "yes" ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Parking:</span>
                    <span className="font-bold text-slate-200">
                      Single: {team.singleParking === "yes" ? "✓" : "✗"} • Double: {team.doubleParking === "yes" ? "✓" : "✗"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Match Loader Intake:</span>
                    <span className={`font-bold ${team.hasMatchloaderIntake === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                      {team.hasMatchloaderIntake === "yes" ? `✓ Yes (${team.matchloaderSpeed || "fast"})` : "✗ No"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pinned Scout Notes */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📌</span> Pinned Scout Notes & Compatibility
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {team.notes || team.scoutNotes || `Team ${team.teamNumber} demonstrates solid field mobility with a ${team.drivetrainSpeed || "fast"} drivetrain. Reliable auton consistency and good alliance synergy.`}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              ✎ Edit Team Data
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors ml-auto shadow-lg shadow-blue-500/20"
          >
            Close Robot Card
          </button>
        </div>

      </div>
    </div>
  );
}
