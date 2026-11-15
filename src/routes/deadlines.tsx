import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalState, uid } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadlines & Countdowns | Productivity Hub AI" },
      { name: "description", content: "Keep track of exams, assignments, and important dates with live countdowns." },
      { property: "og:title", content: "Deadlines & Countdowns | Productivity Hub AI" },
      { property: "og:description", content: "Keep track of exams, assignments, and important dates with live countdowns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeadlinesPage,
});

type DeadlineKind = "Exam" | "Assignment" | "Project" | "Meeting" | "Other";
type Deadline = { id: string; title: string; kind: DeadlineKind; dueAt: string; notes?: string };

const kindStyles: Record<DeadlineKind, string> = {
  Exam: "from-destructive to-secondary",
  Assignment: "from-primary to-accent",
  Project: "from-secondary to-accent",
  Meeting: "from-accent to-primary",
  Other: "from-muted-foreground/60 to-muted-foreground/40",
};

function DeadlinesPage() {
  const [items, setItems] = useLocalState<Deadline[]>("phai:deadlines", []);
  const [draft, setDraft] = useState<Omit<Deadline, "id">>({
    title: "",
    kind: "Assignment",
    dueAt: "",
    notes: "",
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const add = () => {
    if (!draft.title.trim()) return toast.error("Give it a title.");
    if (!draft.dueAt) return toast.error("Pick a date and time.");
    setItems((p) => [{ ...draft, id: uid() }, ...p].sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)));
    setDraft({ title: "", kind: draft.kind, dueAt: "", notes: "" });
    toast.success("Countdown started");
  };
  const remove = (id: string) => setItems((p) => p.filter((d) => d.id !== id));

  const sorted = [...items].sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));

  return (
    <PageShell
      title="Deadlines & Countdowns"
      description="Live countdowns to your exams, assignments and important dates so nothing sneaks up on you."
      icon={<AlarmClock className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold">Add deadline</div>
            <div className="space-y-3">
              <Field label="Title">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Chemistry Midterm" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as DeadlineKind })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Exam", "Assignment", "Project", "Meeting", "Other"] as DeadlineKind[]).map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Due">
                  <Input type="datetime-local" value={draft.dueAt} onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} />
                </Field>
              </div>
              <Field label="Notes (optional)">
                <Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Room, weighting, chapters…" />
              </Field>
              <Button onClick={add} className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          {sorted.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No deadlines yet. Add one and watch it count down.
            </div>
          )}
          {sorted.map((d) => (
            <CountdownCard key={d.id} d={d} now={now} onRemove={() => remove(d.id)} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function CountdownCard({ d, now, onRemove }: { d: Deadline; now: number; onRemove: () => void }) {
  const due = new Date(d.dueAt).getTime();
  const diff = due - now;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const urgent = !past && diff < 3 * 86400000;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm backdrop-blur-sm ${
        urgent ? "border-destructive/40 bg-destructive/5" : "border-border/60 bg-card/70"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${kindStyles[d.kind]}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{d.kind}</div>
          <div className="text-lg font-bold">{d.title}</div>
          <div className="text-xs text-muted-foreground">{new Date(d.dueAt).toLocaleString()}</div>
          {d.notes && <div className="mt-1 text-xs text-muted-foreground">{d.notes}</div>}
        </div>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Unit v={days} label="days" urgent={urgent} past={past} />
        <Unit v={hours} label="hrs" urgent={urgent} past={past} />
        <Unit v={mins} label="min" urgent={urgent} past={past} />
        <Unit v={secs} label="sec" urgent={urgent} past={past} />
      </div>
      {past && (
        <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Past due</div>
      )}
    </div>
  );
}

function Unit({ v, label, urgent, past }: { v: number; label: string; urgent: boolean; past: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        past
          ? "border-border/40 bg-muted/30 text-muted-foreground"
          : urgent
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border/50 bg-background/60 text-foreground"
      }`}
    >
      <div className="text-xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
