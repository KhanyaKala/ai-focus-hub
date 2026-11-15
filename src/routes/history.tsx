import { createFileRoute } from "@tanstack/react-router";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { clearHistory, getHistory } from "@/lib/history";
import type { HistoryItem } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { AIOutput } from "@/components/AIOutput";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "AI Activity History | Productivity Hub AI" },
      { name: "description", content: "Review, reuse, and manage your recent AI-generated responses." },
      { property: "og:title", content: "AI Activity History | Productivity Hub AI" },
      { property: "og:description", content: "Review, reuse, and manage your recent AI-generated responses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const load = () => setItems(getHistory());
    load();
    window.addEventListener("phai:history", load);
    return () => window.removeEventListener("phai:history", load);
  }, []);

  return (
    <PageShell
      title="History"
      description="Everything you've generated recently — search, review, and reuse."
      icon={<HistoryIcon className="h-5 w-5" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => { clearHistory(); setSelected(null); }} disabled={items.length === 0}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear all
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {items.length === 0 && <div className="glass-card p-6 text-sm text-muted-foreground">No history yet.</div>}
          {items.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelected(h)}
              className={`w-full rounded-xl border border-border/60 bg-card/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${selected?.id === h.id ? "ring-2 ring-primary/40" : ""}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{h.tool}</div>
              <div className="mt-0.5 truncate text-sm font-semibold">{h.title}</div>
              <div className="text-[11px] text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3">
          {selected ? (
            <AIOutput content={selected.content} toolName={selected.tool} title={selected.title} />
          ) : (
            <div className="glass-card p-8 text-center text-sm text-muted-foreground">Select an item to view it.</div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
