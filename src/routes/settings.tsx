import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Moon, Sun, GraduationCap, Briefcase } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useRole, type Role } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Productivity Hub AI" },
      { name: "description", content: "Personalise your role, appearance, and local Productivity Hub AI data." },
      { property: "og:title", content: "Settings | Productivity Hub AI" },
      { property: "og:description", content: "Personalise your role, appearance, and local Productivity Hub AI data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { role, setRole } = useRole();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || localStorage.getItem("phai:theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("phai:theme", next ? "dark" : "light"); } catch {}
  };

  const clearAll = () => {
    if (!confirm("This will erase your tasks, notes, chat, and history in this browser. Continue?")) return;
    ["phai:tasks", "phai:notes", "phai:goals", "phai:chat", "phai:history", "phai:saved"].forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
    location.reload();
  };

  return (
    <PageShell title="Settings" description="Personalise the app to your workflow." icon={<SettingsIcon className="h-5 w-5" />}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold">Role</h3>
          <p className="mt-1 text-xs text-muted-foreground">Tailors prompts, examples, and suggestions.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["student", "professional"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${role === r ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/60"}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                  {r === "student" ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                </span>
                <span className="font-semibold capitalize">{r}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-bold">Appearance</h3>
          <p className="mt-1 text-xs text-muted-foreground">Light or dark — up to you.</p>
          <Button variant="outline" className="mt-4" onClick={toggleTheme}>
            {dark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Switch to {dark ? "light" : "dark"} mode
          </Button>
        </div>

        <div className="glass-card p-5 md:col-span-2">
          <h3 className="text-sm font-bold">Your data</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            All your data (tasks, notes, chat, history) is stored locally in this browser. Nothing leaves your device
            except the text you send to the AI when you press Generate.
          </p>
          <Button variant="destructive" className="mt-4" onClick={clearAll}>
            Erase all local data
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
