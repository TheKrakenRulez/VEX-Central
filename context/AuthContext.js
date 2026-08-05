"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, hasFirebaseConfig } from "@/lib/firebase";

const AuthContext = createContext(null);

function getProfileKey(uid) {
  return `vex_user_profile_${uid}`;
}

function loadStoredProfile(uid) {
  const savedProfile = localStorage.getItem(getProfileKey(uid));

  if (!savedProfile) {
    return null;
  }

  try {
    return JSON.parse(savedProfile);
  } catch (error) {
    console.error("Error loading user profile:", error);
    localStorage.removeItem(getProfileKey(uid));
    return null;
  }
}

function saveStoredProfile(uid, profile) {
  const profileToSave = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(getProfileKey(uid), JSON.stringify(profileToSave));
  return profileToSave;
}

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase environment variables are missing.");
  }

  return auth;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(hasFirebaseConfig ? undefined : null); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(hasFirebaseConfig ? undefined : null); // undefined = loading, null = needs onboarding
  const [authError, setAuthError] = useState(
    hasFirebaseConfig ? null : "Firebase configuration is missing or invalid. Please set the NEXT_PUBLIC_FIREBASE_* environment variables and redeploy."
  );

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setProfile(firebaseUser ? loadStoredProfile(firebaseUser.uid) : null);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!hasFirebaseConfig) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.");
    }
    return signInWithPopup(requireAuth(), googleProvider);
  };

  const signUpWithGoogle = async () => {
    if (!hasFirebaseConfig) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.");
    }
    return signInWithPopup(requireAuth(), googleProvider);
  };
  const logout = () => signOut(requireAuth());
  const saveProfile = (profileData) => {
    if (!user) {
      throw new Error("You must be signed in to save your profile.");
    }

    const savedProfile = saveStoredProfile(user.uid, {
      ...profile,
      ...profileData,
      completedOnboarding: true,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    });

    setProfile(savedProfile);
    return savedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        hasFirebaseConfig,
        authError,
        isAuthLoading: user === undefined || (user && profile === undefined),
        signInWithGoogle,
        signUpWithGoogle,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
