import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[];
  pendingProductId: string | null;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setPendingProduct: (productId: string | null) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      pendingProductId: null,
      addItem: (productId) =>
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),
      toggleItem: (productId) =>
        set((state) => {
          const exists = state.items.includes(productId);
          return {
            items: exists
              ? state.items.filter((id) => id !== productId)
              : [...state.items, productId],
          };
        }),
      isInWishlist: (productId) => get().items.includes(productId),
      setPendingProduct: (productId) => set({ pendingProductId: productId }),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "calviz-wishlist-store",
    }
  )
);
