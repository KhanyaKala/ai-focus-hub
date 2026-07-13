import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalState, uid } from "@/lib/storage";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { roleContextLine, useRole } from "@/lib/role-context";

export const Route = createFileRoute("/practicals")({ component: PracticalsPage });

type Practical = {
  id: string;
  title: string;
  module: string;
  date: string;
  location: string;
  manual: string;
  summary: string;
  createdAt: number;
};

function PracticalsPage() {
  const [items, setItems] = useLocalState<Practical[]>("phai:practicals", []);
  const [draft, setDraft] = useState<Omit<Practical, "id" | "summary" | "createdAt">>({
    title: "",
    module: "",
    date: "",
    location: "",
    manual: "",
  });
  const [busy, setBusy] = useState<string | null>(null);
  const generate = useServerFn(generateAI);
  const { role } = useRole();

  const add = () => {
    if (!draft.title.trim()) return toast.error("Give your practical a title.");
    const item: Practical = { ...draft, id: uid(), summary: "", createdAt: Date.now() };
    setItems((prev) => [item, ...prev]);
    setDraft({ title: "", module: "", date: "", location: "", manual: "" });
    toast.success("Practical added");
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const summarise = async (p: Practical) => {
    if (!p.manual.trim()) return toast.error("Paste the practical manual first.");
    setBusy(p.id);
    try {
      const res = await generate({
        data: {
          system: `You are a lab assistant helping a student prepare for a practical. Produce a clear, concise study guide from the practical manual. ${roleContextLine(role)}\n\nAlways return Markdown with these sections:\n\n## Aim\n## Key Concepts\n## Apparatus / Materials\n## Method (numbered steps)\n## Expected Results\n## Safety & Common Mistakes\n## Quick Revision Questions`,
          prompt: `Practical: ${p.title}\nModule: ${p.module}\nDate: ${p.date}\n\nManual:\n${p.manual}`,
        },
      });
      setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, summary: res.text } : x)));
      toast.success("Summary ready");
    } catch (e) {
      toast.error("Could not generate summary. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
  };

  return (
    <PageShell
      title="Practicals"
      description="Track your lab practicals, upload the manual, and get an AI study summary so you never walk in unprepared."
      icon={<FlaskConical className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold">Add practical</div>
            <div className="space-y-3">
              <Field label="Title">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Titration of NaOH with HCl" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Module">
                  <Input value={draft.module} onChange={(e) => setDraft({ ...draft, module: e.target.value })}
                    placeholder="CHEM101" />
                </Field>
                <Field label="Date">
                  <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                </Field>
              </div>
              <Field label="Location">
                <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Lab B2" />
              </Field>
              <Field label="Practical manual (paste text)">
                <Textarea rows={7} value={draft.manual}
                  onChange={(e) => setDraft({ ...draft, manual: e.target.value })}
                  placeholder="Paste the practical manual / lab sheet here…" />
              </Field>
              <Button onClick={add} className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
                Add practical
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No practicals yet. Add one on the left to get started.
            </div>
          )}
          {items.map((p) => {
            const days = daysUntil(p.date);
            return (
              <div key={p.id} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.module || "Practical"}</span>
                      {days !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            days < 0
                              ? "bg-muted text-muted-foreground"
                              : days <= 3
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {days < 0 ? "past" : days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-base font-bold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.date && new Date(p.date).toDateString()} {p.location && `• ${p.location}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => summarise(p)} disabled={busy === p.id}>
                      <Sparkles className="mr-1 h-4 w-4" /> {busy === p.id ? "Generating…" : p.summary ? "Regenerate" : "Summarise"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {p.summary && (
                  <div className="prose prose-sm mt-4 max-w-none border-t border-border/50 pt-4 dark:prose-invert">
                    <ReactMarkdown>{p.summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
          <ResponsibleAI />
        </div>
      </div>
    </PageShell>
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
