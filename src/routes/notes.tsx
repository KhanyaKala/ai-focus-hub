import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AIForm } from "@/components/AIForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

type Values = { transcript: string };

function NotesPage() {
  return (
    <PageShell
      title="Meeting & Lecture Notes Summariser"
      description="Turn long transcripts into clear, actionable notes."
      icon={<FileText className="h-5 w-5" />}
    >
      <AIForm<Values>
        toolName="Notes summary"
        initialValues={{ transcript: "" }}
        systemPrompt={`You transform lecture or meeting transcripts into structured notes. Always return well-formatted Markdown with these sections in this exact order:

## Executive Summary
## Key Topics
## Important Concepts
## Decisions Made
## Action Items
## Follow-up Tasks
## Study Notes / Revision Points

Under Action Items and Follow-up Tasks use checkbox-style bullets like "- [ ] ...". Only include what is actually in the transcript. If a section has nothing, write "_None mentioned._" so the structure stays consistent.`}
        buildUserPrompt={(v) => `Summarise the following transcript into structured notes:\n\n"""\n${v.transcript}\n"""`}
        validate={(v) => (v.transcript.trim().length < 40 ? "Please paste a longer transcript (at least a paragraph)." : null)}
        outputTitle={() => "Notes summary"}
      >
        {({ values, setValues, disabled }) => (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paste your transcript or notes
            </Label>
            <Textarea
              rows={16}
              value={values.transcript}
              disabled={disabled}
              onChange={(e) => setValues((v) => ({ ...v, transcript: e.target.value }))}
              placeholder="Paste the meeting transcript or lecture notes here…"
            />
          </div>
        )}
      </AIForm>
    </PageShell>
  );
}
