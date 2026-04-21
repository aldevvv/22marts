"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCartCount } from "@/lib/api";

interface CartContextType {
  count: number;
  refreshCount: () => void;
}

const CartContext = createContext<CartContextType>({ count: 0, refreshCount: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setCount(0);
        return;
      }
      const user = JSON.parse(storedUser);
      const result = await getCartCount(user.id);
      if (result.data) {
        setCount(result.data.count);
      }
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  return (
    <CartContext.Provider value={{ count, refreshCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
