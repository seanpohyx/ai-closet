import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsState = {
  showFittingRoom: boolean;
};

type SettingsContextType = SettingsState & {
  isHydrated: boolean;
  setShowFittingRoom: (value: boolean) => void;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SETTINGS_STORAGE_KEY = "@settings_v1";

const DEFAULTS: SettingsState = {
  showFittingRoom: false,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showFittingRoom, setShowFittingRoomState] = useState(DEFAULTS.showFittingRoom);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          const parsed: Partial<SettingsState> = JSON.parse(raw);
          if (typeof parsed.showFittingRoom === "boolean") {
            setShowFittingRoomState(parsed.showFittingRoom);
          }
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      } finally {
        setIsHydrated(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const save = async () => {
      try {
        const data: SettingsState = { showFittingRoom };
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Error saving settings:", e);
      }
    };
    save();
  }, [showFittingRoom, isHydrated]);

  const setShowFittingRoom = useCallback((value: boolean) => {
    setShowFittingRoomState(value);
  }, []);

  return (
    <SettingsContext.Provider value={{ showFittingRoom, isHydrated, setShowFittingRoom }}>
      {children}
    </SettingsContext.Provider>
  );
};
