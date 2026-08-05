import { useState } from "react";

export default function MyTeamForm({ initialData, onSave, onCancel, gameMode = "push_back" }) {
  const [formData, setFormData] = useState(initialData || {
    teamNumber: "",
    robotImagePreview: null,
    drivetrainSpeed: "",
    hasAuton: "",
    autonConsistency: "",
    autonPoints: "",
    primaryStrategy: "",
    scoringSpeed: "",
    deScoring: "",
    singleParking: "",
    doubleParking: "",
    hasMatchloaderIntake: "",
    matchloaderSpeed: "",
    blockScoringSpeed: "",
    cupScoringSpeed: "",
    canFlipBlocks: "",
    canFlipCups: "",
    hasToggleAbility: "",
  });

  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const isOverride = gameMode === "override" || initialData?.gameMode === "override";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          robotImage: event.target.result,
          robotImagePreview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.teamNumber.trim()) {
      setError("Team number is required");
      return;
    }

    onSave({
      ...formData,
      gameMode: isOverride ? "override" : "push_back",
    });
  };

  // Step 1: Basic Info
  if (currentStep === 1) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
        <h2 className="text-2xl font-bold font-mono text-white mb-6">
          Set My Team - Basic Info
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-slate-300 mb-2">
              Team Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="teamNumber"
              value={formData.teamNumber}
              onChange={handleInputChange}
              placeholder="e.g., 3197A"
              className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-slate-300 mb-2">
              Robot Image
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded p-4 text-center">
              {formData.robotImagePreview ? (
                <div className="space-y-2">
                  <img
                    src={formData.robotImagePreview}
                    alt="Robot preview"
                    className="w-full max-h-40 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        robotImagePreview: null,
                      }))
                    }
                    className="text-red-400 hover:text-red-300 text-sm font-mono transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <span className="text-slate-400 font-mono text-sm">
                    Click to upload or drag and drop
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono text-slate-300 mb-2">
              Drivetrain Speed
            </label>
            <div className="space-y-2">
              {["fast", "average", "slow"].map((speed) => (
                <label key={speed} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="drivetrainSpeed"
                    value={speed}
                    checked={formData.drivetrainSpeed === speed}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300 capitalize font-mono">{speed}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-2 text-red-300 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
            >
              Next Step →
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Autonomy
  if (currentStep === 2) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
        <h2 className="text-2xl font-bold font-mono text-white mb-6">
          Set My Team - Auton
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-slate-300 mb-2">
              Does your team have Auton?
            </label>
            <div className="space-y-2">
              {["yes", "no"].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hasAuton"
                    value={option}
                    checked={formData.hasAuton === option}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300 capitalize font-mono">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.hasAuton === "yes" && (
            <>
              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Auton Consistency (%)
                </label>
                <input
                  type="number"
                  name="autonConsistency"
                  value={formData.autonConsistency}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Auton Points Usually Scored
                </label>
                <input
                  type="number"
                  name="autonPoints"
                  value={formData.autonPoints}
                  onChange={handleInputChange}
                  placeholder="e.g., 15"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-2 text-red-300 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
            >
              Next Step →
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Game-specific capabilities
  if (currentStep === 3) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-mono text-white">
            Set My Team - Game Skills
          </h2>
          <span className={`px-3 py-1 text-xs font-mono font-bold rounded uppercase tracking-wider ${isOverride ? "bg-purple-900/50 border border-purple-500 text-purple-300" : "bg-orange-900/50 border border-orange-500 text-orange-300"}`}>
            {isOverride ? "26-27 Override" : "25-26 Push Back"}
          </span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(4); }} className="space-y-4">
          {isOverride ? (
            <>
              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Block Scoring Speed
                </label>
                <div className="space-y-2">
                  {["fast", "average", "slow", "none"].map((speed) => (
                    <label key={speed} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="blockScoringSpeed"
                        value={speed}
                        checked={formData.blockScoringSpeed === speed}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{speed}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Cup Scoring Speed
                </label>
                <div className="space-y-2">
                  {["fast", "average", "slow", "none"].map((speed) => (
                    <label key={speed} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="cupScoringSpeed"
                        value={speed}
                        checked={formData.cupScoringSpeed === speed}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{speed}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Can Flip Blocks?
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="canFlipBlocks"
                        value={option}
                        checked={formData.canFlipBlocks === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Can Flip Cups?
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="canFlipCups"
                        value={option}
                        checked={formData.canFlipCups === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Toggle Ability
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasToggleAbility"
                        value={option}
                        checked={formData.hasToggleAbility === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Does your robot have a Matchloader Intake?
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasMatchloaderIntake"
                        value={option}
                        checked={formData.hasMatchloaderIntake === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.hasMatchloaderIntake === "yes" && (
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2">
                    Matchloader Intake Speed
                  </label>
                  <div className="space-y-2">
                    {["fast", "med", "slow"].map((speed) => (
                      <label key={speed} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="matchloaderSpeed"
                          value={speed}
                          checked={formData.matchloaderSpeed === speed}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-300 capitalize font-mono">{speed}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-2 text-red-300 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
            >
              Next Step →
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 4: Strategy
  if (currentStep === 4) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-mono text-white">
            Set My Team - Strategy
          </h2>
          <span className={`px-3 py-1 text-xs font-mono font-bold rounded uppercase tracking-wider ${isOverride ? "bg-purple-900/50 border border-purple-500 text-purple-300" : "bg-orange-900/50 border border-orange-500 text-orange-300"}`}>
            {isOverride ? "26-27 Override" : "25-26 Push Back"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-slate-300 mb-2">
              Primary Strategy
            </label>
            <div className="space-y-2">
              {["offense", "defense", "balanced"].map((strategy) => (
                <label key={strategy} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryStrategy"
                    value={strategy}
                    checked={formData.primaryStrategy === strategy}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300 capitalize font-mono">{strategy}</span>
                </label>
              ))}
            </div>
          </div>

          {!isOverride && (
            <>
              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Scoring Speed
                </label>
                <div className="space-y-2">
                  {["fast", "average", "slow", "none"].map((speed) => (
                    <label key={speed} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="scoringSpeed"
                        value={speed}
                        checked={formData.scoringSpeed === speed}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{speed}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  De-Scoring Capability
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deScoring"
                        value={option}
                        checked={formData.deScoring === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Single Parking Capability
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="singleParking"
                        value={option}
                        checked={formData.singleParking === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-slate-300 mb-2">
                  Double Parking Capability
                </label>
                <div className="space-y-2">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="doubleParking"
                        value={option}
                        checked={formData.doubleParking === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize font-mono">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-2 text-red-300 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
            >
              Save Team
            </button>
          </div>
        </form>
      </div>
    );
  }
}
