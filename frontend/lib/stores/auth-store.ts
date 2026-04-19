import { create } from "zustand";

type AuthStore = {
  sessionRevision: number;
  notifyAuthChanged: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  sessionRevision: 0,
  notifyAuthChanged: () => set((s) => ({ sessionRevision: s.sessionRevision + 1 })),
}));
