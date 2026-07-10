import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AIForm } from "@/components/AIForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

type Values = {
  topic: string;
  purpose: string;
  detail: "Brief" | "Standard" | "Deep dive";
  audience: string;
};

function ResearchPage() {
  return (
    <PageShell
      title="AI Research Assistant"
      description="Get a structured launchpad for any topic — then verify and go deeper."
      icon={<Search className="h-5 w-5" />}
    >
      <AIForm<Values>
        toolName="Research"
        initialValues={{ topic: "", purpose: "", detail: "Standard", audience: "" }}
        systemPrompt={`You are a research assistant. Return Markdown with these sections:

## Summary
## Key Findings
## Important Facts
## Main Concepts
## Suggested Resources (author/publication/book titles only — do NOT invent URLs)
## Further Questions
## Next Steps

Be balanced, note uncertainty where relevant, and remind the reader to verify sources.`}
        buildUserPrompt={(v) => `Research topic: ${v.topic}
Purpose: ${v.purpose || "(general research)"}
Audience: ${v.audience || "(general)"}
Detail level: ${v.detail}`}
        validate={(v) => (!v.topic.trim() ? "Please enter a topic to research." : null)}
        outputTitle={(v) => v.topic || "Research"}
      >
        {({ values, setValues, disabled }) => (
          <>
            <Field label="Topic">
              <Input value={values.topic} disabled={disabled}
                onChange={(e) => setValues((v) => ({ ...v, topic: e.target.value }))}
                placeholder="e.g. Climate policy in the EU" />
            </Field>
            <Field label="Purpose">
              <Textarea rows={3} value={values.purpose} disabled={disabled}
                onChange={(e) => setValues((v) => ({ ...v, purpose: e.target.value }))}
                placeholder="Why do you need this research?" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Detail level">
                <Select value={values.detail} onValueChange={(x) => setValues((v) => ({ ...v, detail: x as Values["detail"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brief">Brief</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deep dive">Deep dive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Audience">
                <Input value={values.audience} disabled={disabled}
                  onChange={(e) => setValues((v) => ({ ...v, audience: e.target.value }))}
                  placeholder="e.g. university tutor" />
              </Field>
            </div>
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
