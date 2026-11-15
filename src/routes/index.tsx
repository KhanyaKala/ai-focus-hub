import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  Search,
  MessageSquare,
  Sparkles,
  Target,
  Timer,
  Quote,
  TrendingUp,
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useRole } from "@/lib/role-context";
import { useLocalState, uid, type Task, type Note, type Goal } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useRef, useState } from "react";
import { getHistory } from "@/lib/history";
import type { HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Productivity Hub AI | Personal productivity dashboard" },
      { name: "description", content: "Organise study and work with personalised AI tools, tasks, notes, goals, and productivity insights." },
      { property: "og:title", content: "Productivity Hub AI | Personal productivity dashboard" },
      { property: "og:description", content: "Organise study and work with personalised AI tools, tasks, notes, goals, and productivity insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TIPS = [
  "Time-box focused work in 25-minute Pomodoro sprints.",
  "Batch similar tasks together to reduce context switching.",
  "Draft first, edit second — never do both at the same time.",
  "Use the 2-minute rule: if it takes under 2 minutes, do it now.",
  "Plan tomorrow tonight — decisions are cheaper before bedtime.",
  "Ask AI to summarise before you dive into long documents.",
];

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Focus is a matter of deciding what things you're not going to do. — John Carmack",
  "You do not rise to the level of your goals. You fall to the level of your systems. — James Clear",
  "It always seems impossible until it's done. — Nelson Mandela",
];

function dayIndex() {
  return Math.floor(Date.now() / 86400000);
}

function Dashboard() {
  const { role } = useRole();
  const isStudent = role === "student";

  const [tasks, setTasks] = useLocalState<Task[]>("phai:tasks", []);
  const [notes, setNotes] = useLocalState<Note[]>("phai:notes", []);
  const [goals, setGoals] = useLocalState<Goal[]>("phai:goals", []);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const load = () => setHistory(getHistory());
    load();
    window.addEventListener("phai:history", load);
    return () => window.removeEventListener("phai:history", load);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => t.due === today && !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length || 1;
  const score = Math.min(100, Math.round((doneCount / totalCount) * 100));

  const tip = TIPS[dayIndex() % TIPS.length];
  const quote = QUOTES[dayIndex() % QUOTES.length];

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const quickActions = isStudent
    ? [
        { label: "Email my lecturer", to: "/email" },
        { label: "Summarise lecture", to: "/notes" },
        { label: "Build study plan", to: "/planner" },
        { label: "Research a topic", to: "/research" },
      ]
    : [
        { label: "Draft client email", to: "/email" },
        { label: "Summarise meeting", to: "/notes" },
        { label: "Plan my week", to: "/planner" },
        { label: "Research market", to: "/research" },
      ];

  return (
    <PageShell
      title={`${greeting}${role ? `, ${isStudent ? "Student" : "Pro"}` : ""}`}
      description={isStudent ? "Let's make studying feel effortless today." : "Let's ship great work today."}
      icon={<Sparkles className="h-5 w-5" />}
    >
      <div className="grid gap-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              <Flame className="h-3 w-3 text-orange-500" /> Productivity Score {score}
            </div>
            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              What can <span className="gradient-text">AI help you with</span> today?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Pick a quick action or jump into any tool. Your AI assistant is tuned for {isStudent ? "students" : "professionals"}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="rounded-full border border-border/60 bg-card/80 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Due today" value={dueToday} icon={<CalendarClock className="h-4 w-4" />} accent="from-blue-500 to-cyan-400" />
          <StatCard label="Completed" value={doneCount} icon={<CheckCircle2 className="h-4 w-4" />} accent="from-emerald-500 to-lime-400" />
          <StatCard label="Focus streak" value={`${(dayIndex() % 12) + 1}d`} icon={<Flame className="h-4 w-4" />} accent="from-orange-500 to-pink-500" />
          <StatCard label="AI runs" value={history.length} icon={<Sparkles className="h-4 w-4" />} accent="from-fuchsia-500 to-violet-500" />
        </div>

        {/* Tool grid */}
        <div>
          <SectionTitle title="AI toolkit" subtitle="Everything you need in one place" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard to="/email" icon={<Mail className="h-5 w-5" />} title="Smart Email Generator" body={isStudent ? "Emails to lecturers, extensions, internships." : "Client emails, follow-ups, invites."} grad="from-blue-500 to-cyan-400" />
            <ToolCard to="/notes" icon={<FileText className="h-5 w-5" />} title="Notes Summariser" body={isStudent ? "Turn lectures into revision notes." : "Turn meeting transcripts into actions."} grad="from-emerald-500 to-teal-400" />
            <ToolCard to="/planner" icon={<CalendarClock className="h-5 w-5" />} title="AI Task Planner" body={isStudent ? "Build a study timetable." : "Plan your work week."} grad="from-fuchsia-500 to-pink-500" />
            <ToolCard to="/research" icon={<Search className="h-5 w-5" />} title="Research Assistant" body={isStudent ? "Kickstart assignments & revision." : "Reports and market research."} grad="from-orange-500 to-rose-500" />
            <ToolCard to="/chat" icon={<MessageSquare className="h-5 w-5" />} title="AI Chatbot" body="Chat naturally — plan, brainstorm, learn." grad="from-violet-500 to-indigo-500" />
            <ToolCard to="/planner" icon={<Target className="h-5 w-5" />} title="Goal Tracker" body="Track progress on what matters." grad="from-cyan-500 to-blue-500" />
          </div>
        </div>

        {/* Widgets grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <TasksWidget tasks={tasks} setTasks={setTasks} />
          <div className="space-y-6">
            <PomodoroWidget />
            <TipCard tip={tip} />
          </div>
          <div className="space-y-6">
            <GoalsWidget goals={goals} setGoals={setGoals} />
            <QuoteCard quote={quote} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StickyNotesWidget notes={notes} setNotes={setNotes} />
          </div>
          <RecentActivity history={history} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <WeeklyProgress score={score} tasks={tasks} />
          <div className="lg:col-span-2 glass-card p-6">
            <SectionTitle title="Responsible AI" small />
            <p className="mt-2 text-sm text-muted-foreground">
              AI-generated content may occasionally contain inaccuracies. Always review and verify before submitting
              assignments, sending emails, or making business decisions. You remain responsible for all final content.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function SectionTitle({ title, subtitle, small }: { title: string; subtitle?: string; small?: boolean }) {
  return (
    <div className={small ? "mb-2" : "mb-4"}>
      <h3 className={small ? "text-sm font-bold" : "text-lg font-bold"}>{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white shadow`}>
          {icon}
        </span>
      </div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function ToolCard({ to, icon, title, body, grad }: { to: string; icon: React.ReactNode; title: string; body: string; grad: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${grad} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
      <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white shadow`}>{icon}</div>
      <h4 className="mt-4 text-base font-bold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open →
      </div>
    </Link>
  );
}

function TasksWidget({ tasks, setTasks }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setTasks((v) => [{ id: uid(), title: text.trim(), done: false, due: new Date().toISOString().slice(0, 10) }, ...v]);
    setText("");
  };
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <SectionTitle title="Today's tasks" small />
        <span className="text-xs text-muted-foreground">{tasks.filter((t) => !t.done).length} open</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task…"
        />
        <Button size="icon" onClick={add} className="bg-gradient-to-br from-primary to-accent">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
        {tasks.length === 0 && <li className="text-xs text-muted-foreground">No tasks yet — add one above.</li>}
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={t.done}
              onChange={(e) => setTasks((v) => v.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)))}
            />
            <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
            <button
              onClick={() => setTasks((v) => v.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PomodoroWidget() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            setRunning(false);
            return 25 * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pct = 100 - (secs / (25 * 60)) * 100;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-bold">Focus timer</h4>
      </div>
      <div className="mt-3 text-center">
        <div className="text-4xl font-black tabular-nums gradient-text">{mm}:{ss}</div>
      </div>
      <Progress value={pct} className="mt-3" />
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent" onClick={() => setRunning((v) => !v)}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setRunning(false); setSecs(25 * 60); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function TipCard({ tip }: { tip: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-primary/10 p-5">
      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">AI tip of the day</span>
      </div>
      <p className="mt-2 text-sm font-medium">{tip}</p>
    </div>
  );
}

function QuoteCard({ quote }: { quote: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-fuchsia-500/10 p-5">
      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-300">
        <Quote className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Daily motivation</span>
      </div>
      <p className="mt-2 text-sm italic">{quote}</p>
    </div>
  );
}

function GoalsWidget({ goals, setGoals }: { goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>> }) {
  const [text, setText] = useState("");
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-500" />
        <h4 className="text-sm font-bold">Goal tracker</h4>
      </div>
      <div className="mt-2 flex gap-2">
        <Input placeholder="Add a goal…" value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { setGoals((v) => [{ id: uid(), title: text.trim(), progress: 0 }, ...v]); setText(""); } }} />
      </div>
      <ul className="mt-4 space-y-3">
        {goals.length === 0 && <li className="text-xs text-muted-foreground">No goals yet.</li>}
        {goals.map((g) => (
          <li key={g.id}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate pr-2">{g.title}</span>
              <button onClick={() => setGoals((v) => v.filter((x) => x.id !== g.id))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={g.progress}
              onChange={(e) => setGoals((v) => v.map((x) => (x.id === g.id ? { ...x, progress: Number(e.target.value) } : x)))}
              className="mt-1 w-full accent-[var(--primary)]"
            />
            <div className="text-[11px] text-muted-foreground">{g.progress}% complete</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StickyNotesWidget({ notes, setNotes }: { notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>> }) {
  const colors = ["bg-yellow-200/70", "bg-pink-200/70", "bg-cyan-200/70", "bg-emerald-200/70", "bg-orange-200/70"];
  const add = () => setNotes((v) => [{ id: uid(), text: "", color: colors[v.length % colors.length], updatedAt: Date.now() }, ...v]);
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold">Quick sticky notes</h4>
        </div>
        <Button size="sm" variant="ghost" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {notes.length === 0 && <div className="text-xs text-muted-foreground col-span-full">No notes yet.</div>}
        {notes.map((n) => (
          <div key={n.id} className={`rounded-xl p-3 shadow-sm ${n.color}`}>
            <textarea
              value={n.text}
              onChange={(e) => setNotes((v) => v.map((x) => (x.id === n.id ? { ...x, text: e.target.value, updatedAt: Date.now() } : x)))}
              placeholder="Type…"
              className="h-24 w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
            />
            <div className="mt-1 flex items-center justify-end">
              <button onClick={() => setNotes((v) => v.filter((x) => x.id !== n.id))} className="text-gray-600 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ history }: { history: HistoryItem[] }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-fuchsia-500" />
        <h4 className="text-sm font-bold">Recent AI activity</h4>
      </div>
      <ul className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
        {history.length === 0 && <li className="text-xs text-muted-foreground">Nothing yet — try a tool to see it here.</li>}
        {history.slice(0, 8).map((h) => (
          <li key={h.id} className="rounded-lg border border-border/50 bg-card/60 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{h.tool}</div>
            <div className="truncate text-sm">{h.title}</div>
            <div className="text-[11px] text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyProgress({ score, tasks }: { score: number; tasks: Task[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="glass-card p-5">
      <SectionTitle title="Weekly progress" small />
      <div className="mt-3 flex items-end justify-between gap-2 h-32">
        {days.map((d, i) => {
          const h = 20 + ((score + i * 13) % 80);
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary via-accent to-secondary"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{d}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {tasks.length} tasks tracked · productivity score {score}
      </div>
    </div>
  );
}
