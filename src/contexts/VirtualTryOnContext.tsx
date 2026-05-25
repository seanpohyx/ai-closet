import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { VirtualTryOnItem } from "../types/VirtualTryOn";
import { v4 as uuidv4 } from "uuid";

type VirtualTryOnContextType = {
  recentTryOns: VirtualTryOnItem[];
  addTryOn: (tryOn: Omit<VirtualTryOnItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryItems: (ids: Set<string>) => Promise<void>;
  userPhotoUri: string | null;
  setUserPhotoUri: (uri: string | null) => void;
};

export const VirtualTryOnContext = createContext<VirtualTryOnContextType | null>(null);

const USER_PHOTO_KEY = "@fitting_room_user_photo";

export const VirtualTryOnProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentTryOns, setRecentTryOns] = useState<VirtualTryOnItem[]>([]);
  const [userPhotoUri, setUserPhotoUriState] = useState<string | null>(null);
  const [photoHydrated, setPhotoHydrated] = useState(false);

  // Load try-on history from AsyncStorage on mount. Prune entries whose
  // result file no longer exists on disk (old cacheDirectory paths from
  // before the fix, or files evicted by the OS).
  useEffect(() => {
    const loadTryOns = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@try_on_history");
        if (jsonValue == null) return;
        const parsed: VirtualTryOnItem[] = JSON.parse(jsonValue);
        const checks = await Promise.all(
          parsed.map(async (item) => {
            try {
              const info = await FileSystem.getInfoAsync(item.resultImageUri);
              return info.exists ? item : null;
            } catch {
              return null;
            }
          })
        );
        const alive = checks.filter((x): x is VirtualTryOnItem => x !== null);
        setRecentTryOns(alive);
        if (alive.length !== parsed.length) {
          await AsyncStorage.setItem("@try_on_history", JSON.stringify(alive));
        }
      } catch (e) {
        console.error("Error loading try-on history:", e);
      }
    };
    loadTryOns();
  }, []);

  // Save try-ons to AsyncStorage whenever they change
  useEffect(() => {
    const saveTryOns = async () => {
      try {
        await AsyncStorage.setItem("@try_on_history", JSON.stringify(recentTryOns));
      } catch (e) {
        console.error("Error saving try-on history:", e);
      }
    };
    saveTryOns();
  }, [recentTryOns]);

  // Load persisted user photo on mount. If the file no longer exists
  // (cache eviction, sandbox path change), drop it so the UI doesn't
  // show a broken thumbnail.
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_PHOTO_KEY);
        if (stored) {
          const info = await FileSystem.getInfoAsync(stored);
          if (info.exists) {
            setUserPhotoUriState(stored);
          } else {
            await AsyncStorage.removeItem(USER_PHOTO_KEY);
          }
        }
      } catch (e) {
        console.error("Error loading fitting room user photo:", e);
      } finally {
        setPhotoHydrated(true);
      }
    };
    loadPhoto();
  }, []);

  // Persist user photo whenever it changes (after hydration).
  useEffect(() => {
    if (!photoHydrated) return;
    const save = async () => {
      try {
        if (userPhotoUri) {
          await AsyncStorage.setItem(USER_PHOTO_KEY, userPhotoUri);
        } else {
          await AsyncStorage.removeItem(USER_PHOTO_KEY);
        }
      } catch (e) {
        console.error("Error saving fitting room user photo:", e);
      }
    };
    save();
  }, [userPhotoUri, photoHydrated]);

  const setUserPhotoUri = (uri: string | null) => setUserPhotoUriState(uri);

  const addTryOn = async (tryOn: Omit<VirtualTryOnItem, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTryOn: VirtualTryOnItem = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...tryOn,
    };

    setRecentTryOns((prev) => [newTryOn, ...prev].slice(0, 100)); // Keep only the 100 most recent
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("@try_on_history");
      setRecentTryOns([]);
    } catch (e) {
      console.error("Error clearing try-on history:", e);
    }
  };

  // (Note: the saved Fitting Room user photo lives under a separate key
  // and is NOT cleared here — clearing history shouldn't force the user
  // to re-upload their photo. Use clearAllData for a full wipe.)

  // New method to delete specific items
  const deleteHistoryItems = async (ids: Set<string>) => {
    try {
      const updatedTryOns = recentTryOns.filter((item) => !ids.has(item.id));
      setRecentTryOns(updatedTryOns);
    } catch (e) {
      console.error("Error deleting try-on history items:", e);
      throw e; // Re-throw to handle in the UI
    }
  };

  return (
    <VirtualTryOnContext.Provider
      value={{ recentTryOns, addTryOn, clearHistory, deleteHistoryItems, userPhotoUri, setUserPhotoUri }}
    >
      {children}
    </VirtualTryOnContext.Provider>
  );
};
