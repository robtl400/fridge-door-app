import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { createKitchen, verifyKitchen } from "../services/kitchenApi";

const STORAGE_KEY = "shelflife_kitchen_key";
const RECENT_KEY = "shelflife_recent_kitchens";
const MAX_RECENT = 5;

const KitchenContext = createContext(null);

function getStoredKey() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return sessionStorage.getItem(STORAGE_KEY);
  }
}

function storeKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    sessionStorage.setItem(STORAGE_KEY, key);
  }
}

function addToRecent(key) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const recent = raw ? JSON.parse(raw) : [];
    const updated = [key, ...recent.filter((k) => k !== key)].slice(
      0,
      MAX_RECENT
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — skip recent tracking
  }
}

export function getRecentKitchens() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function KitchenProvider({ children }) {
  const [kitchenKey, setKitchenKey] = useState(null);
  const [kitchenInfo, setKitchenInfo] = useState(null);
  const [isNewKitchen, setIsNewKitchen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize: check URL param, then localStorage
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);

      // URL param takes precedence
      const urlKey = searchParams.get("kitchen");
      const storedKey = getStoredKey();
      const keyToTry = urlKey || storedKey;

      if (keyToTry) {
        try {
          const info = await verifyKitchen(keyToTry);
          if (info) {
            setKitchenKey(keyToTry);
            setKitchenInfo(info);
            storeKey(keyToTry);
            addToRecent(keyToTry);
            // Clean URL param after successful load
            if (urlKey) {
              setSearchParams({}, { replace: true });
            }
            setLoading(false);
            return;
          }
        } catch {
          // Network error — let user retry
          setError("network");
          setLoading(false);
          return;
        }
      }

      // No valid key found — show onboarding to collect username
      setNeedsOnboarding(true);
      setLoading(false);
    }

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createNewKitchen = useCallback(async (username) => {
    try {
      const info = await createKitchen({ username });
      setKitchenKey(info.kitchen_key);
      setKitchenInfo(info);
      storeKey(info.kitchen_key);
      addToRecent(info.kitchen_key);
      setIsNewKitchen(true);
      setNeedsOnboarding(false);
      return info;
    } catch {
      setError("create_failed");
      return null;
    }
  }, []);

  const switchKitchen = useCallback(async (newKey) => {
    try {
      const info = await verifyKitchen(newKey);
      if (!info) return false;
      setKitchenKey(newKey);
      setKitchenInfo(info);
      storeKey(newKey);
      addToRecent(newKey);
      setIsNewKitchen(false);
      setNeedsOnboarding(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    setIsNewKitchen(false);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Re-trigger init by resetting state
    window.location.reload();
  }, []);

  return (
    <KitchenContext.Provider
      value={{
        kitchenKey,
        kitchenInfo,
        isNewKitchen,
        needsOnboarding,
        loading,
        error,
        switchKitchen,
        createNewKitchen,
        dismissWelcome,
        retry,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen() {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
