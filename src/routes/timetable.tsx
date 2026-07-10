import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus, Trash2, Sparkles, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalState, uid } from "@/lib/storage";
import { useRole } from "@/lib/role-context";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { pushHistory } from "@/lib/history";
import { AIOutput } from "@/components/AIOutput";
import { toast } from "sonner";

export const Route = createFileRoute("/timetable")({
  component: TimetablePage,
});

type Lecture = {
  id: string;
  day: Day;
  start: string; // "09:00"
  end: string;   // "10:30"
  subject: string;
  location?: string;
  lecturer?: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 8 → 21

function TimetablePage() {
  const { role } = useRole();
  const [lectures, setLectures] = useLocalState<Lecture[]>("phai:timetable", []);
  const [draft, setDraft] = useState<Lecture>({
    id: "",
    day: "Mon",
    start: "09:00",
    end: "10:30",
    subject: "",
    location: "",
    lecturer: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  const isStudent = role === "student";

  const grouped = useMemo(() => {
    const map = new Map<Day, Lecture[]>();
    DAYS.forEach((d) => map.set(d, []));
    lectures.forEach((l) => map.get(l.day)?.push(l));
    map.forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [lectures]);

  const addLecture = () => {
    if (!draft.subject.trim()) return toast.error("Add a subject name.");
    if (draft.end <= draft.start) return toast.error("End time must be after start time.");
    setLectures((prev) => [...prev, { ...draft, id: uid() }]);
    setDraft((d) => ({ ...d, subject: "", location: "", lecturer: "" }));
  };

  const remove = (id: string) => setLectures((prev) => prev.filter((l) => l.id !== id));
  const clearAll = () => {
    if (confirm("Clear the entire timetable?")) setLectures([]);
  };

  const asText = () =>
    DAYS.map((d) => {
      const list = grouped.get(d) ?? [];
      if (!list.length) return `${d}: (free)`;
      return `${d}:\n${list.map((l) => `  ${l.start}–${l.end} ${l.subject}${l.location ? ` @ ${l.location}` : ""}${l.lecturer ? ` (${l.lecturer})` : ""}`).join("\n")}`;
    }).join("\n\n");

  const askAI = async () => {
    if (!lectures.length) return toast.error("Add at least one lecture first.");
    setLoading(true);
    try {
      const system = `You are a study coach for university students. Given a lecture timetable, produce a weekly study plan in clean Markdown with these sections:

## Overview
## Weekly Study Blocks
### Monday … Sunday
List "**HH:MM – HH:MM** — activity" that fills the gaps between lectures with focused study, breaks, and revision. Do NOT overwrite lecture times. Keep evenings realistic.
## Subject Priorities
## Tips`;
      const prompt = `Here is my lecture timetable:\n\n${asText()}\n\nBuild a realistic study plan around it.`;
      const res = await generate({ data: { system, prompt } });
      setOutput(res.text);
      pushHistory({ tool: "Timetable", title: "Study plan around lectures", content: res.text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const exportText = () => {
    const blob = new Blob([asText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isStudent) {
    return (
      <PageShell
        title="Lecture Timetable"
        description="Available in Student mode."
        icon={<CalendarDays className="h-5 w-5" />}
      >
        <div className="glass-card p-8 text-center text-sm text-muted-foreground">
          Switch to <span className="font-semibold text-foreground">Student</span> mode from the sidebar to use the lecture timetable.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Lecture Timetable"
      description="Enter your weekly lectures and let AI plan study time around them."
      icon={<CalendarDays className="h-5 w-5" />}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportText} disabled={!lectures.length}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={!lectures.length}>
            Clear all
          </Button>
          <Button
            size="sm"
            onClick={askAI}
            disabled={loading}
            className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            {loading ? "Planning…" : "AI Study Plan"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold">Add a lecture</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Day">
                <Select value={draft.day} onValueChange={(v) => setDraft((d) => ({ ...d, day: v as Day }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div />
              <Field label="Start">
                <Input type="time" value={draft.start} onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))} />
              </Field>
              <Field label="End">
                <Input type="time" value={draft.end} onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))} />
              </Field>
            </div>
            <div className="mt-3 space-y-3">
              <Field label="Subject">
                <Input value={draft.subject} placeholder="e.g. Data Structures" onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <Input value={draft.location} placeholder="Room 204" onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} />
                </Field>
                <Field label="Lecturer">
                  <Input value={draft.lecturer} placeholder="Dr. Smith" onChange={(e) => setDraft((d) => ({ ...d, lecturer: e.target.value }))} />
                </Field>
              </div>
            </div>
            <Button onClick={addLecture} className="mt-4 w-full">
              <Plus className="mr-1 h-4 w-4" /> Add lecture
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {DAYS.map((d) => (
                <div key={d} className="px-2 py-2 text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {DAYS.map((d) => {
                const list = grouped.get(d) ?? [];
                return (
                  <div key={d} className="min-h-[280px] border-r border-border/40 p-2 last:border-r-0">
                    {list.length === 0 && (
                      <div className="mt-6 text-center text-[11px] text-muted-foreground/60">—</div>
                    )}
                    <div className="space-y-1.5">
                      {list.map((l) => (
                        <div
                          key={l.id}
                          className="group relative rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 p-2 text-xs"
                        >
                          <div className="font-semibold">{l.subject}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {l.start}–{l.end}
                          </div>
                          {l.location && (
                            <div className="text-[10px] text-muted-foreground">📍 {l.location}</div>
                          )}
                          {l.lecturer && (
                            <div className="text-[10px] text-muted-foreground">👤 {l.lecturer}</div>
                          )}
                          <button
                            onClick={() => remove(l.id)}
                            className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(output || loading) && (
            <div className="mt-6">
              <AIOutput
                content={output}
                loading={loading}
                toolName="Timetable"
                title="Study plan around lectures"
                onRegenerate={askAI}
                onClear={() => setOutput("")}
              />
            </div>
          )}
        </div>
      </div>

      <div className="sr-only">{HOURS.join(",")}</div>
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
