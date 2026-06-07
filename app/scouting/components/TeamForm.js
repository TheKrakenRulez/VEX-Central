import { useState } from "react";

export default function TeamForm({ onAddTeam, onCancel }) {
    const [formData, setFormData] = useState({
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
    });

    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);

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

        // Only validate team number
        if (!formData.teamNumber.trim()) {
            setError("Team number is required");
            return;
        }

        onAddTeam(formData);
    };

    // Step 1: Basic Info
    if (currentStep === 1) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
                <h2 className="text-2xl font-bold font-mono text-white mb-6">
                    Add Team - Basic Info
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
                    Add Team - Auton
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-mono text-slate-300 mb-2">
                            Does the team have Auton?
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

    // Step 3: Strategy and Capabilities
    if (currentStep === 3) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 max-w-2xl">
                <h2 className="text-2xl font-bold font-mono text-white mb-6">
                    Add Team - Strategy & Capabilities
                </h2>

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
                            Add Team
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}
