import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AIForm } from "@/components/AIForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | Productivity Hub AI" },
      { name: "description", content: "Create a realistic daily or weekly plan from your goals, tasks, deadlines, and available time." },
      { property: "og:title", content: "AI Task Planner | Productivity Hub AI" },
      { property: "og:description", content: "Create a realistic daily or weekly plan from your goals, tasks, deadlines, and available time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

type Values = {
  goals: string;
  tasks: string;
  deadlines: string;
  hoursPerDay: string;
  priority: "Low" | "Medium" | "High";
  horizon: "Today" | "This week";
};

function PlannerPage() {
  return (
    <PageShell
      title="AI Task Planner"
      description="Turn a messy to-do list into a realistic plan."
      icon={<CalendarClock className="h-5 w-5" />}
    >
      <AIForm<Values>
        toolName="Planner"
        initialValues={{ goals: "", tasks: "", deadlines: "", hoursPerDay: "4", priority: "Medium", horizon: "This week" }}
        systemPrompt={`You are an expert productivity coach. Build a realistic plan based ONLY on the tasks, hours, and deadlines provided. Always return Markdown with these sections:

## Overview
## Prioritised Tasks
## Time Blocks
### Monday ... Sunday (or Today's schedule when the horizon is Today)
List time blocks like "**09:00 – 10:30** — Task"
## Productivity Recommendations

Respect the daily hour budget. Never overload a day. If you cannot fit everything, say so under Overview.`}
        buildUserPrompt={(v) => `Plan horizon: ${v.horizon}
Available hours per day: ${v.hoursPerDay}
Default priority: ${v.priority}

Goals:
${v.goals || "(none listed)"}

Tasks (one per line):
${v.tasks || "(none listed)"}

Deadlines:
${v.deadlines || "(none listed)"}`}
        validate={(v) => (!v.tasks.trim() ? "Please add at least one task." : null)}
        outputTitle={(v) => `${v.horizon} plan`}
      >
        {({ values, setValues, disabled }) => (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Horizon">
                <Select value={values.horizon} onValueChange={(x) => setValues((v) => ({ ...v, horizon: x as Values["horizon"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="This week">This week</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Hours / day">
                <Input type="number" min={1} max={16} value={values.hoursPerDay} disabled={disabled}
                  onChange={(e) => setValues((v) => ({ ...v, hoursPerDay: e.target.value }))} />
              </Field>
            </div>
            <Field label="Priority">
              <Select value={values.priority} onValueChange={(x) => setValues((v) => ({ ...v, priority: x as Values["priority"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Goals">
              <Textarea rows={2} value={values.goals} disabled={disabled}
                onChange={(e) => setValues((v) => ({ ...v, goals: e.target.value }))}
                placeholder="What are you trying to achieve?" />
            </Field>
            <Field label="Tasks">
              <Textarea rows={5} value={values.tasks} disabled={disabled}
                onChange={(e) => setValues((v) => ({ ...v, tasks: e.target.value }))}
                placeholder="One task per line…" />
            </Field>
            <Field label="Deadlines">
              <Textarea rows={2} value={values.deadlines} disabled={disabled}
                onChange={(e) => setValues((v) => ({ ...v, deadlines: e.target.value }))}
                placeholder="e.g. Essay due Fri, Demo Tue 3pm" />
            </Field>
          </>
        )}
      </AIForm>
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
