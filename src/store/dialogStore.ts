import { create } from "zustand";
import { combine } from "zustand/middleware";

export interface Dialog {
  isOpen: boolean;
  tokenTyp?: "buy" | "sell";
  onCloseCallBack?: () => void;
}

export interface DialogAction {
  setDialog: (isOpen: boolean, tokenTyp?: Dialog["tokenTyp"]) => void;
  setOnCloseCallBack: (callback: Dialog["onCloseCallBack"]) => void;
}

export const useDialogStore = create(
  combine<Dialog, DialogAction>(
    { isOpen: false, tokenTyp: "sell", onCloseCallBack: undefined },
    (set, get) => ({
      setDialog: (isOpen, tokenTyp) => {
        const callback = get().onCloseCallBack;

        if (!isOpen && callback) {
          callback(); // Execute callback when closing the dialog
        }

        set({ isOpen, tokenTyp });
      },
      setOnCloseCallBack: (onCloseCallBack) => set({ onCloseCallBack }),
    })
  )
);
