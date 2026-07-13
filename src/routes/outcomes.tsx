import { createFileRoute } from "@tanstack/react-router";
import { Target, Trash2, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useLocalState, uid } from "@/lib/storage";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/outcomes")({ component: OutcomesPage });

type Outcome = { id: string; text: string; covered: boolean; note?: string };
type Module = { id: string; name: string; code: string; outcomes: Outcome[]; plan?: string };

function OutcomesPage() {
  const [modules, setModules] = useLocalState<Module[]>("phai:outcomes", []);
  const [newModule, setNewModule] = useState({ name: "", code: "" });
  const [newOutcomeText, setNewOutcomeText] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const generate = useServerFn(generateAI);

  const addModule = () => {
    if (!newModule.name.trim()) return toast.error("Give the module a name.");
    setModules((p) => [{ id: uid(), name: newModule.name, code: newModule.code, outcomes: [] }, ...p]);
    setNewModule({ name: "", code: "" });
  };

  const removeModule = (id: string) => setModules((p) => p.filter((m) => m.id !== id));

  const addOutcome = (moduleId: string) => {
    const text = (newOutcomeText[moduleId] || "").trim();
    if (!text) return;
    setModules((p) =>
      p.map((m) =>
        m.id === moduleId
          ? { ...m, outcomes: [...m.outcomes, { id: uid(), text, covered: false }] }
          : m,
      ),
    );
    setNewOutcomeText((s) => ({ ...s, [moduleId]: "" }));
  };

  const bulkAddOutcomes = (moduleId: string, blob: string) => {
    const lines = blob.split("\n").map((l) => l.replace(/^[\d.\-\)\s]+/, "").trim()).filter(Boolean);
    if (lines.length === 0) return;
    setModules((p) =>
      p.map((m) =>
        m.id === moduleId
          ? { ...m, outcomes: [...m.outcomes, ...lines.map((t) => ({ id: uid(), text: t, covered: false }))] }
          : m,
      ),
    );
    setNewOutcomeText((s) => ({ ...s, [moduleId]: "" }));
    toast.success(`Added ${lines.length} outcomes`);
  };

  const toggle = (moduleId: string, outcomeId: string) => {
    setModules((p) =>
      p.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              outcomes: m.outcomes.map((o) => (o.id === outcomeId ? { ...o, covered: !o.covered } : o)),
            }
          : m,
      ),
    );
  };

  const removeOutcome = (moduleId: string, outcomeId: string) =>
    setModules((p) =>
      p.map((m) => (m.id === moduleId ? { ...m, outcomes: m.outcomes.filter((o) => o.id !== outcomeId) } : m)),
    );

  const buildExamPlan = async (m: Module) => {
    const uncovered = m.outcomes.filter((o) => !o.covered);
    if (uncovered.length === 0) return toast.success("Everything covered — nice work!");
    setBusy(m.id);
    try {
      const res = await generate({
        data: {
          system:
            "You are an exam prep coach. Produce a focused, prioritised study plan for the outcomes the student has NOT yet covered. Group by theme. For each theme give: what to learn, a practice tip, and a self-test question. Return Markdown with clear headings.",
          prompt: `Module: ${m.name} (${m.code})\n\nOutcomes not yet covered:\n${uncovered.map((o, i) => `${i + 1}. ${o.text}`).join("\n")}`,
        },
      });
      setModules((p) => p.map((x) => (x.id === m.id ? { ...x, plan: res.text } : x)));
      toast.success("Study plan ready");
    } catch {
      toast.error("Could not generate. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageShell
      title="Module Outcomes"
      description="Track every learning outcome per module so you walk into exams knowing every part is covered."
      icon={<Target className="h-5 w-5" />}
    >
      <div className="mb-6 glass-card p-5">
        <div className="mb-3 text-sm font-semibold">Add a module</div>
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-xs"
            placeholder="Module name"
            value={newModule.name}
            onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
          />
          <Input
            className="max-w-[140px]"
            placeholder="Code (e.g. MATH201)"
            value={newModule.code}
            onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
          />
          <Button onClick={addModule} className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {modules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No modules yet. Add one above to start tracking exam readiness.
        </div>
      )}

      <div className="space-y-5">
        {modules.map((m) => {
          const total = m.outcomes.length;
          const covered = m.outcomes.filter((o) => o.covered).length;
          const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
          return (
            <div key={m.id} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{m.code || "Module"}</div>
                  <div className="text-lg font-bold">{m.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{covered} / {total} outcomes covered</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => buildExamPlan(m)} disabled={busy === m.id || total === 0}>
                    <Sparkles className="mr-1 h-4 w-4" /> {busy === m.id ? "Planning…" : "Exam plan for gaps"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeModule(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={pct} className="mt-3 h-2" />

              <ul className="mt-4 space-y-2">
                {m.outcomes.map((o) => (
                  <li key={o.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
                    <Checkbox checked={o.covered} onCheckedChange={() => toggle(m.id, o.id)} className="mt-0.5" />
                    <span className={`flex-1 text-sm ${o.covered ? "text-muted-foreground line-through" : ""}`}>{o.text}</span>
                    <button className="text-muted-foreground hover:text-destructive" onClick={() => removeOutcome(m.id, o.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <Textarea
                  rows={2}
                  placeholder="Add an outcome, or paste a whole list (one per line) then click Add."
                  value={newOutcomeText[m.id] || ""}
                  onChange={(e) => setNewOutcomeText((s) => ({ ...s, [m.id]: e.target.value }))}
                />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => addOutcome(m.id)}>
                    Add one
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => bulkAddOutcomes(m.id, newOutcomeText[m.id] || "")}>
                    Add all lines
                  </Button>
                </div>
              </div>

              {m.plan && (
                <div className="prose prose-sm mt-4 max-w-none border-t border-border/50 pt-4 dark:prose-invert">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AI exam plan for uncovered outcomes
                  </div>
                  <ReactMarkdown>{m.plan}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modules.length > 0 && <ResponsibleAI />}
    </PageShell>
  );
}
