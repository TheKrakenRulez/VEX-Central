"use client";
import { useState } from "react";

export default function ProfileForm({
  initialProfile = {},
  submitLabel = "Save Profile",
  onSubmit,
}) {
  const [preferredName, setPreferredName] = useState(
    initialProfile.preferredName ?? initialProfile.name ?? ""
  );
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile.dateOfBirth ?? "");
  const [organization, setOrganization] = useState(initialProfile.organization ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedPreferredName = preferredName.trim();
    const trimmedDateOfBirth = dateOfBirth.trim();
    const trimmedOrganization = organization.trim();

    if (!trimmedPreferredName || !trimmedDateOfBirth || !trimmedOrganization) {
      setErrorMessage("Please fill out every field.");
      return;
    }

    const birthDate = new Date(`${trimmedDateOfBirth}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
      setErrorMessage("Please enter a valid date of birth.");
      return;
    }

    try {
      setErrorMessage("");
      setIsSaving(true);
      await onSubmit({
        preferredName: trimmedPreferredName,
        dateOfBirth: trimmedDateOfBirth,
        organization: trimmedOrganization,
      });
    } catch (error) {
      console.error("Profile save error:", error);
      setErrorMessage("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
          Preferred Name
        </span>
        <input
          type="text"
          value={preferredName}
          onChange={(event) => setPreferredName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-red-500"
          placeholder="Jane"
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
          Date of Birth
        </span>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-red-500"
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
          School / Organization
        </span>
        <input
          type="text"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-blue-500"
          placeholder="VEX Robotics Team"
        />
      </label>

      {errorMessage && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs font-mono text-red-300">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-red-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
