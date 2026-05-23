import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Position+scale in silhouette space. The "stage" is a 3:4 canvas with the
// silhouette guide lines at fixed ratios. Each item (user photo or garment)
// stores its own transform so that, when rendered together, they share the
// silhouette coordinate system and stack naturally.
export type Transform = {
  scale: number;
  xRatio: number;
  yRatio: number;
};

export const IDENTITY_TRANSFORM: Transform = { scale: 1, xRatio: 0, yRatio: 0 };

type CarouselContextType = {
  userPhotoUri: string | null;
  setUserPhotoUri: (uri: string | null) => void;
  userPhotoTransform: Transform | null;
  setUserPhotoTransform: (t: Transform | null) => void;
  hasSeenUploadTips: boolean;
  setHasSeenUploadTips: (value: boolean) => void;
  isHydrated: boolean;
};

export const CarouselContext = createContext<CarouselContextType | null>(null);

// v3: silhouette-alignment model. Earlier versions used per-category transforms.
const STORAGE_KEY = "@carousel_state_v3";

type PersistedState = {
  userPhotoUri: string | null;
  userPhotoTransform: Transform | null;
  hasSeenUploadTips: boolean;
};

export const CarouselProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPhotoUri, setUserPhotoUriState] = useState<string | null>(null);
  const [userPhotoTransform, setUserPhotoTransformState] = useState<Transform | null>(null);
  const [hasSeenUploadTips, setHasSeenUploadTipsState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          setUserPhotoUriState(parsed.userPhotoUri ?? null);
          setUserPhotoTransformState(parsed.userPhotoTransform ?? null);
          setHasSeenUploadTipsState(parsed.hasSeenUploadTips ?? false);
        }
      } catch (e) {
        console.error("Error loading carousel state:", e);
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
        const data: PersistedState = {
          userPhotoUri,
          userPhotoTransform,
          hasSeenUploadTips,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Error saving carousel state:", e);
      }
    };
    save();
  }, [userPhotoUri, userPhotoTransform, hasSeenUploadTips, isHydrated]);

  const setUserPhotoUri = useCallback((uri: string | null) => {
    setUserPhotoUriState(uri);
    if (uri === null) {
      setUserPhotoTransformState(null);
    }
  }, []);

  const setUserPhotoTransform = useCallback((t: Transform | null) => {
    setUserPhotoTransformState(t);
  }, []);

  const setHasSeenUploadTips = useCallback((value: boolean) => {
    setHasSeenUploadTipsState(value);
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        userPhotoUri,
        setUserPhotoUri,
        userPhotoTransform,
        setUserPhotoTransform,
        hasSeenUploadTips,
        setHasSeenUploadTips,
        isHydrated,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
};
