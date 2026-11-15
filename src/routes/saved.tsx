import { createFileRoute } from "@tanstack/react-router";
import { BookmarkCheck, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { getSaved, removeSaved } from "@/lib/history";
import type { HistoryItem } from "@/lib/storage";
import { AIOutput } from "@/components/AIOutput";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved AI Documents | Productivity Hub AI" },
      { name: "description", content: "Access and reuse your saved AI responses and productivity documents." },
      { property: "og:title", content: "Saved AI Documents | Productivity Hub AI" },
      { property: "og:description", content: "Access and reuse your saved AI responses and productivity documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const load = () => setItems(getSaved());
    load();
    window.addEventListener("phai:saved", load);
    return () => window.removeEventListener("phai:saved", load);
  }, []);

  return (
    <PageShell
      title="Saved Documents"
      description="Your favourite AI responses, kept safe."
      icon={<BookmarkCheck className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {items.length === 0 && <div className="glass-card p-6 text-sm text-muted-foreground">Nothing saved yet — hit ⭐ Save on any AI output.</div>}
          {items.map((h) => (
            <div key={h.id} className={`group flex items-start gap-2 rounded-xl border border-border/60 bg-card/70 p-3 ${selected?.id === h.id ? "ring-2 ring-primary/40" : ""}`}>
              <button onClick={() => setSelected(h)} className="flex-1 text-left min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{h.tool}</div>
                <div className="mt-0.5 truncate text-sm font-semibold">{h.title}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</div>
              </button>
              <button
                onClick={() => { removeSaved(h.id); if (selected?.id === h.id) setSelected(null); }}
                className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="lg:col-span-3">
          {selected ? (
            <AIOutput content={selected.content} toolName={selected.tool} title={selected.title} />
          ) : (
            <div className="glass-card p-8 text-center text-sm text-muted-foreground">Select a document to view it.</div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
