import { useRole, type Role } from "@/lib/role-context";
import { GraduationCap, Briefcase, Sparkles } from "lucide-react";

export function RoleGate({ children }: { children: React.ReactNode }) {
  const { role, setRole, ready } = useRole();

  if (!ready) {
    return <div className="min-h-svh bg-background" />;
  }

  if (role) return <>{children}</>;

  const options: { key: Role; icon: React.ReactNode; title: string; blurb: string; grad: string; tags: string[] }[] = [
    {
      key: "student",
      icon: <GraduationCap className="h-7 w-7" />,
      title: "Student",
      blurb: "Ace assignments, summarise lectures, plan revision, and study smarter.",
      grad: "from-blue-500 via-cyan-400 to-emerald-400",
      tags: ["Assignments", "Study planner", "Lecture notes", "Research"],
    },
    {
      key: "professional",
      icon: <Briefcase className="h-7 w-7" />,
      title: "Professional",
      blurb: "Draft client emails, summarise meetings, plan sprints, and prep for wins.",
      grad: "from-fuchsia-500 via-pink-500 to-orange-400",
      tags: ["Client emails", "Meeting notes", "Weekly plan", "Research"],
    },
  ];

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Welcome to Productivity Hub AI
        </div>
        <h1 className="text-center text-4xl font-black leading-tight tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Get more done,
          </span>
          <br />
          effortlessly with AI.
        </h1>
        <p className="mt-4 max-w-xl text-center text-base text-muted-foreground md:text-lg">
          Choose how you'd like to use the platform. We'll tailor prompts, suggestions, and examples to fit you.
        </p>

        <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => setRole(o.key)}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-8 text-left shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${o.grad} opacity-30 blur-2xl transition-opacity group-hover:opacity-60`}
              />
              <div
                className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${o.grad} text-white shadow-lg`}
              >
                {o.icon}
              </div>
              <h3 className="mt-5 text-2xl font-bold">
                {o.key === "student" ? "🎓 Student" : "💼 Professional"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{o.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {o.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Continue as {o.title}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          You can switch your role any time from the sidebar. Your data stays in this browser — no account needed.
        </p>
      </div>
    </div>
  );
}
