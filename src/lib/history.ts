import type { HistoryItem } from "./storage";

const HKEY = "phai:history";
const SKEY = "phai:saved";

function read(key: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}
function write(key: string, items: HistoryItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

export function pushHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  const items = read(HKEY);
  const next: HistoryItem = { ...item, id: Math.random().toString(36).slice(2, 10), createdAt: Date.now() };
  write(HKEY, [next, ...items]);
  window.dispatchEvent(new Event("phai:history"));
  return next;
}
export function getHistory() {
  return read(HKEY);
}
export function clearHistory() {
  write(HKEY, []);
  window.dispatchEvent(new Event("phai:history"));
}

export function saveDoc(item: HistoryItem) {
  const items = read(SKEY);
  if (items.find((i) => i.id === item.id)) return;
  write(SKEY, [item, ...items]);
  window.dispatchEvent(new Event("phai:saved"));
}
export function getSaved() {
  return read(SKEY);
}
export function removeSaved(id: string) {
  write(
    SKEY,
    read(SKEY).filter((i) => i.id !== id),
  );
  window.dispatchEvent(new Event("phai:saved"));
}
