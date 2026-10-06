import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Customer } from "@/types";
import { fetchCustomerProfile } from "@/lib/api";

interface AuthStore {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (customer: Customer, token: string) => void;
  updateCustomer: (customer: Customer) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isAuthenticated: false,
      setAuth: (customer, token) =>
        set({
          customer,
          token,
          isAuthenticated: true,
        }),
      updateCustomer: (customer) =>
        set({
          customer,
        }),
      logout: () =>
        set({
          customer: null,
          token: null,
          isAuthenticated: false,
        }),
      refreshProfile: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const profile = await fetchCustomerProfile(token);
          set({ customer: profile, isAuthenticated: true });
        } catch {
          // Token expired or invalid
          set({ customer: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "calviz-customer-auth",
    }
  )
);
