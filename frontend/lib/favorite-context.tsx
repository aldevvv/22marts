"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getFavoriteCount } from "@/lib/api";

interface FavoriteContextType {
  count: number;
  refreshCount: () => void;
}

const FavoriteContext = createContext<FavoriteContextType>({ count: 0, refreshCount: () => {} });

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setCount(0);
        return;
      }
      const user = JSON.parse(storedUser);
      const result = await getFavoriteCount(user.id);
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
    <FavoriteContext.Provider value={{ count, refreshCount }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  return useContext(FavoriteContext);
}
