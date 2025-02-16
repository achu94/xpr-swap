// store/alertStore.ts
import { create } from "zustand";

interface AlertState {
  message: string | null;
  type: "success" | "error" | "info";
  showAlert: (message: string, type?: AlertState["type"]) => void;
  clearAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  message: null,
  type: "info",
  showAlert: (message, type = "info") => set({ message, type }),
  clearAlert: () => set({ message: null }),
}));
