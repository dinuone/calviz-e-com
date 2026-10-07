import { create } from "zustand";

interface AuthModalOptions {
  tab?: "login" | "register";
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

interface AuthModalStore {
  isOpen: boolean;
  tab: "login" | "register";
  title?: string;
  description?: string;
  onSuccessCallback?: () => void;
  openModal: (options?: AuthModalOptions) => void;
  closeModal: () => void;
  setTab: (tab: "login" | "register") => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  tab: "login",
  title: undefined,
  description: undefined,
  onSuccessCallback: undefined,
  openModal: (options) =>
    set({
      isOpen: true,
      tab: options?.tab || "login",
      title: options?.title,
      description: options?.description,
      onSuccessCallback: options?.onSuccess,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      title: undefined,
      description: undefined,
      onSuccessCallback: undefined,
    }),
  setTab: (tab) => set({ tab }),
}));
