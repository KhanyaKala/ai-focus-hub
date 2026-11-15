import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ | Productivity Hub AI" },
      { name: "description", content: "Find answers about role settings, local data, and using AI tools in Productivity Hub AI." },
      { property: "og:title", content: "Help & FAQ | Productivity Hub AI" },
      { property: "og:description", content: "Find answers about role settings, local data, and using AI tools in Productivity Hub AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  { q: "How does the AI understand my role?", a: "When you pick Student or Professional, every prompt sent to the AI includes that role so responses, examples, and tone match how you work." },
  { q: "Where is my data stored?", a: "Tasks, notes, chat threads, history, and saved documents all live in your browser's localStorage. No account required." },
  { q: "Can I edit AI output?", a: "Yes — every AI response has Edit, Copy, Regenerate, Download, and Save buttons. You are always in control of the final content." },
  { q: "How do I switch roles?", a: "Open the sidebar and click 'Switch role', or go to Settings → Role." },
  { q: "Should I trust everything the AI says?", a: "No. AI can be wrong or outdated. Always verify facts, references, and critical decisions before acting on them." },
];

function HelpPage() {
  return (
    <PageShell title="Help & FAQ" description="Everything you need to get the most out of Productivity Hub AI." icon={<HelpCircle className="h-5 w-5" />}>
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className="group glass-card p-5 transition-all open:shadow-md">
            <summary className="cursor-pointer list-none text-sm font-bold flex justify-between items-center">
              {f.q}
              <span className="text-primary transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
