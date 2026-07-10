import { useEffect, useState } from "react";

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export type Task = { id: string; title: string; done: boolean; due?: string; priority?: "low" | "med" | "high" };
export type Note = { id: string; text: string; color: string; updatedAt: number };
export type Goal = { id: string; title: string; progress: number };
export type HistoryItem = { id: string; tool: string; title: string; content: string; createdAt: number };
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; ts: number };
export type ChatThread = { id: string; title: string; updatedAt: number; messages: ChatMessage[] };

export const uid = () => Math.random().toString(36).slice(2, 10);
