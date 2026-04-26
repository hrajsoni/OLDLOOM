import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  slug: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.sku === newItem.sku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === newItem.sku
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (sku) => {
        set((state) => ({ items: state.items.filter((i) => i.sku !== sku) }));
      },

      updateQty: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.sku === sku ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      itemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'oldloom-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : sessionStorage
      ),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);
