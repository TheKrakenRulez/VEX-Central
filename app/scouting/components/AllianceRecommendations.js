import { useState } from "react";
import { calculatePartnerScore, generateCoachComment } from "../utils/partnerScore";

export default function AllianceRecommendations({ myTeam, allTeams, gameMode = "push_back" }) {
  const [showScoringDetails, setShowScoringDetails] = useState(false);
  const isOverride = gameMode === "override";

  const [filters, setFilters] = useState({
    // Shared filters
    mustHaveAuton: false,
    mustHaveDefense: false,
    // Push Back filters
    mustHaveDeScoring: false,
    mustHaveDoubleParking: false,
    mustHaveSingleParking: false,
    mustHaveFastScoring: false,
    // Override filters
    mustHaveFlipBlocks: false,
    mustHaveFlipCups: false,
    mustHaveToggle: false,
    mustHaveFastBlockScoring: false,
    mustHaveFastCupScoring: false,
  });

  const handleFilterChange = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Exclude myTeam from recommendations list
  const candidates = allTeams.filter(
    (t) => t.teamNumber.trim().toLowerCase() !== myTeam.teamNumber.trim().toLowerCase()
  );

  // Apply filters
  const filteredCandidates = candidates.filter((team) => {
    if (filters.mustHaveAuton && team.hasAuton !== "yes") return false;
    if (filters.mustHaveDefense && team.primaryStrategy !== "defense") return false;

    if (isOverride) {
      if (filters.mustHaveFlipBlocks && team.canFlipBlocks !== "yes") return false;
      if (filters.mustHaveFlipCups && team.canFlipCups !== "yes") return false;
      if (filters.mustHaveToggle && team.hasToggleAbility !== "yes") return false;
      if (filters.mustHaveFastBlockScoring && team.blockScoringSpeed !== "fast") return false;
      if (filters.mustHaveFastCupScoring && team.cupScoringSpeed !== "fast") return false;
    } else {
      if (filters.mustHaveDeScoring && team.deScoring !== "yes") return false;
      if (filters.mustHaveDoubleParking && team.doubleParking !== "yes") return false;
      if (filters.mustHaveSingleParking && team.singleParking !== "yes") return false;
      if (filters.mustHaveFastScoring && team.scoringSpeed !== "fast") return false;
    }
    return true;
  });

  // Calculate scores and sort
  const scoredCandidates = filteredCandidates.map((team) => ({
    team,
    score: calculatePartnerScore(myTeam, team, gameMode),
    coachComment: generateCoachComment(myTeam, team, gameMode),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);

  // Take top 3
  const topRecommendations = scoredCandidates.slice(0, 3);

  // Filter options based on game mode
  const filterOptions = isOverride
    ? {
      mustHaveAuton: "Auton",
      mustHaveFlipBlocks: "Flip Blocks",
      mustHaveFlipCups: "Flip Cups",
      mustHaveToggle: "Toggle",
      mustHaveFastBlockScoring: "Fast Blocks",
      mustHaveFastCupScoring: "Fast Cups",
      mustHaveDefense: "Defense",
    }
    : {
      mustHaveAuton: "Auton",
      mustHaveDeScoring: "De-Scoring",
      mustHaveDoubleParking: "Double Park",
      mustHaveSingleParking: "Single Park",
      mustHaveFastScoring: "Fast Scoring",
      mustHaveDefense: "Defense",
    };

  const accentColor = isOverride ? "purple" : "orange";

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 mb-12 backdrop-blur-sm">
      <div className="border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-mono tracking-tight text-white uppercase">
              Alliance Partner Match Scout
            </h2>
            <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded uppercase tracking-wider ${isOverride
                ? "bg-purple-900/50 border border-purple-500/40 text-purple-400"
                : "bg-orange-900/50 border border-orange-500/40 text-orange-400"
              }`}>
              {isOverride ? "Override" : "Push Back"}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono mt-1">
            Analyzing {candidates.length} candidate teams for optimal synergy with Team {myTeam.teamNumber}
          </p>
        </div>
        <button
          onClick={() => setShowScoringDetails(!showScoringDetails)}
          className={`text-xs font-mono border bg-slate-950/20 px-3 py-2 rounded-lg transition-all shrink-0 flex items-center gap-2 self-start sm:self-center ${isOverride
              ? "text-purple-400 hover:text-purple-300 border-purple-500/30 hover:border-purple-500/60"
              : "text-cyan-400 hover:text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60"
            }`}
        >
          <span>{showScoringDetails ? "▲ Hide Scoring Details" : "▼ Learn more about our scoring system"}</span>
        </button>
      </div>

      <div className={showScoringDetails ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "w-full"}>
        {/* Main Recommendation Column */}
        <div className={showScoringDetails ? "lg:col-span-2 space-y-6" : "w-full space-y-6"}>
          {/* Must-Haves Filter Bar */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4">
            <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              Filter by Must-Haves
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(filterOptions).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer select-none transition-all font-mono text-xs ${filters[key]
                      ? isOverride
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => handleFilterChange(key)}
                    className="hidden"
                  />
                  <span className={filters[key] ? (isOverride ? "text-purple-400" : "text-blue-400") : "text-slate-600"}>
                    {filters[key] ? "✓" : "+"}
                  </span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recommendations list */}
          {topRecommendations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
              No matching candidates found. Try loosening your must-have filters.
            </div>
          ) : (
            <div className="space-y-6">
              {topRecommendations.map(({ team, score, coachComment }, index) => (
                <div
                  key={team.id}
                  className={`relative overflow-hidden border rounded-xl bg-slate-950/40 p-5 transition-all flex flex-col md:flex-row gap-6 items-start ${isOverride
                      ? "border-slate-800 hover:border-purple-500/30"
                      : "border-slate-800 hover:border-blue-500/30"
                    }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-0 left-0 text-white font-black font-mono px-3 py-1 text-xs rounded-br-lg ${isOverride ? "bg-purple-600" : "bg-blue-600"
                    }`}>
                    RANK #{index + 1}
                  </div>

                  {/* Left Side: Score & Core details */}
                  <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-4 border border-slate-800/60 mt-3 md:mt-0">
                    <div className={`text-3xl font-extrabold font-mono tracking-tight ${isOverride ? "text-purple-400" : "text-cyan-400"}`}>
                      {score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                      Partner Score
                    </div>
                    <div className="w-full border-t border-slate-800/80 my-3" />
                    <div className="text-center">
                      <span className="text-base font-black font-mono text-white">Team {team.teamNumber}</span>
                      <div className="text-[11px] text-slate-400 capitalize font-mono mt-1">
                        {team.primaryStrategy || "Balanced Strategy"}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Explainers & Comment */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Match Scout Analysis
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-mono">
                        {coachComment}
                      </p>
                    </div>

                    {/* Detail Grid - Override or Push Back */}
                    {isOverride ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[11px] font-mono border-t border-slate-800/60 pt-3 mt-3">
                        <div>
                          <span className="text-slate-500">Auton:</span>
                          <span className="block text-white font-bold">
                            {team.hasAuton === "yes" ? `${team.autonConsistency || 0}% (${team.autonPoints || 0} pts)` : "No Auton"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Drivetrain:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.drivetrainSpeed || "average"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Block Scoring:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.blockScoringSpeed || "none"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Cup Scoring:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.cupScoringSpeed || "none"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Flip Blocks:</span>
                          <span className={`block font-bold ${team.canFlipBlocks === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                            {team.canFlipBlocks === "yes" ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Flip Cups:</span>
                          <span className={`block font-bold ${team.canFlipCups === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                            {team.canFlipCups === "yes" ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Toggle:</span>
                          <span className={`block font-bold ${team.hasToggleAbility === "yes" ? "text-purple-400" : "text-slate-500"}`}>
                            {team.hasToggleAbility === "yes" ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[11px] font-mono border-t border-slate-800/60 pt-3 mt-3">
                        <div>
                          <span className="text-slate-500">Auton:</span>
                          <span className="block text-white font-bold">
                            {team.hasAuton === "yes" ? `${team.autonConsistency || 0}% (${team.autonPoints || 0} pts)` : "No Auton"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Drivetrain Speed:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.drivetrainSpeed || "average"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Scoring Speed:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.scoringSpeed || "average"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Matchloader Intake:</span>
                          <span className="block text-white font-bold capitalize text-cyan-400">
                            {team.hasMatchloaderIntake === "yes" ? `${team.matchloaderSpeed || "average"}` : "no"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">De-Scoring:</span>
                          <span className={`block font-bold ${team.deScoring === "yes" ? "text-emerald-400" : "text-slate-500"}`}>
                            {team.deScoring === "yes" ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">End-Game Park:</span>
                          <span className="block text-white font-bold capitalize">
                            {team.doubleParking === "yes" ? "Double" : team.singleParking === "yes" ? "Single" : "None"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scoring System Breakdown Sidebar */}
        {showScoringDetails && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800/80">
                {isOverride ? "Override Scoring System (Max 100)" : "Scoring System (Max 100)"}
              </h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Our Match Scout algorithm scores other teams on compatibility out of 100 points based on your team&apos;s metrics:
              </p>

              {isOverride ? (
                /* Override Scoring Breakdown */
                <div className="space-y-3">
                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>1. Auton Performance</span>
                      <span className="text-purple-400">Max 35 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Auton consistency combined with scored points</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>2. Block Scoring Speed</span>
                      <span className="text-purple-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10), Average (5), Slow (2.5) block scoring</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>3. Cup Scoring Speed</span>
                      <span className="text-purple-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10), Average (5), Slow (2.5) cup scoring</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>4. Flipping Capabilities</span>
                      <span className="text-purple-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Block flip (5 pts) + Cup flip (5 pts)</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>5. Toggle Ability</span>
                      <span className="text-purple-400">10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Activates strategic scoring advantages in the wall zone</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>6. Drivetrain Speed</span>
                      <span className="text-purple-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10 pts), Average (5 pts), Slow (2.5 pts)</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>7. Strategy Synergy</span>
                      <span className="text-purple-400">Max 15 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Awarded for optimal strategy combination</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>8. Auton Gap-Fill</span>
                      <span className="text-purple-400">Max 15 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Boosts Auton partners if your team lacks Auton</p>
                  </div>
                </div>
              ) : (
                /* Push Back Scoring Breakdown */
                <div className="space-y-3">
                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>1. Auton Performance</span>
                      <span className="text-cyan-400">Max 35 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Auton consistency combined with scored points</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>2. Drivetrain Speed</span>
                      <span className="text-cyan-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10 pts), Average (5 pts), Slow (2.5 pts)</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>3. Matchloader Intake</span>
                      <span className="text-cyan-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10 pts), Med (7 pts), Slow (4 pts) matchload clearing</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>4. De-Scoring Capability</span>
                      <span className="text-cyan-400">10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Awarded if team can disrupt opponent scoring zones</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>5. End-Game Parking</span>
                      <span className="text-cyan-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Double Parking (5 pts), Single Parking (5 pts) - can stack</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>6. Scoring Speed</span>
                      <span className="text-cyan-400">Max 10 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Fast (10 pts), Average (5 pts), Slow (2.5 pts) scoring bonus</p>
                  </div>

                  <div className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>7. Strategy Synergy</span>
                      <span className="text-cyan-400">Max 15 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Awarded for optimal strategy combination</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-200 font-bold mb-1">
                      <span>8. Auton Gap-Fill</span>
                      <span className="text-cyan-400">Max 15 pts</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Boosts Auton partners if your team doesn&apos;t have Auton</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


