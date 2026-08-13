import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Deliberately account-free: a random device-scoped ID plus whatever the
// person chooses to fill in, persisted locally. Low friction matters more
// than identity here — nobody should have to sign up mid-emergency to
// report a flood or trigger an SOS.

const STORAGE_KEY = 'raksha_profile';

function makeUserId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userId) return parsed;
    }
  } catch {
    /* fall through to default */
  }
  return null;
}

function defaultProfile() {
  return {
    userId: makeUserId(),
    name: '',
    language: 'en',
    emergencyContacts: [],
    familyGroupCode: '',
    adminToken: null,
  };
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(() => loadProfile() || defaultProfile());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* private browsing / storage full — profile just won't persist */
    }
  }, [profile]);

  const updateProfile = useCallback((patch) => setProfile((prev) => ({ ...prev, ...patch })), []);

  const addEmergencyContact = useCallback((contact) => {
    setProfile((prev) => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, contact] }));
  }, []);

  const removeEmergencyContact = useCallback((index) => {
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  }, []);

  const setAdminToken = useCallback((token) => setProfile((prev) => ({ ...prev, adminToken: token })), []);

  return (
    <UserContext.Provider
      value={{ profile, updateProfile, addEmergencyContact, removeEmergencyContact, setAdminToken }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
