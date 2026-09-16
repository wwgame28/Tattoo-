import { create } from "zustand";

type SettingsState = {
  autoCapture: boolean;
  voice: boolean;
  grid: boolean;
  aiReview: boolean;
  setAutoCapture: (value: boolean) => void;
  setVoice: (value: boolean) => void;
  setGrid: (value: boolean) => void;
  setAiReview: (value: boolean) => void;
};

export const useSettings = create<SettingsState>((set) => ({
  autoCapture: true,
  voice: true,
  grid: true,
  aiReview: true,
  setAutoCapture: (autoCapture) => set({ autoCapture }),
  setVoice: (voice) => set({ voice }),
  setGrid: (grid) => set({ grid }),
  setAiReview: (aiReview) => set({ aiReview }),
}));
