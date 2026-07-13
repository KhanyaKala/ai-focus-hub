import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AIForm } from "@/components/AIForm";
import { SendActions } from "@/components/SendActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/email")({
  component: EmailPage,
});

type EmailValues = {
  recipient: string;
  subject: string;
  purpose: string;
  keyPoints: string;
  tone: "Formal" | "Friendly" | "Persuasive";
};

function EmailPage() {
  return (
    <PageShell
      title="Smart Email Generator"
      description="Draft polished emails in seconds — you always stay in control."
      icon={<Mail className="h-5 w-5" />}
    >
      <AIForm<EmailValues>
        toolName="Email"
        initialValues={{ recipient: "", subject: "", purpose: "", keyPoints: "", tone: "Formal" }}
        systemPrompt="You are an expert email writer. Produce a single, polished email ready to send. Use the requested tone. Include an appropriate greeting and sign-off. Do NOT invent facts — only use the key points provided. If information is missing, use tasteful placeholders like [Your Name]."
        outputTitle={(v) => v.subject || "Draft email"}
        buildUserPrompt={(v) => `Write an email with the following details:

Recipient: ${v.recipient || "(not specified)"}
Subject: ${v.subject || "(please suggest)"}
Purpose: ${v.purpose}
Key points to include:
${v.keyPoints}

Tone: ${v.tone}

Return only the email body in Markdown, starting with a subject line as a heading, then the email content.`}
        validate={(v) => (!v.purpose.trim() ? "Please describe the purpose of the email." : null)}
        examples={{
          student: [
            "Email my lecturer about an assignment extension",
            "Enquire about a summer internship",
            "Ask for feedback on my draft essay",
          ],
          professional: [
            "Follow up with a client after a call",
            "Send a project update to my team",
            "Invite stakeholders to a meeting",
          ],
        }}
        onFillExample={(ex, setValues) =>
          setValues((v) => ({
            ...v,
            purpose: ex,
            subject: v.subject || ex,
          }))
        }
      >
        {({ values, setValues, disabled }) => (
          <>
            <Field label="Recipient">
              <Input value={values.recipient} onChange={(e) => setValues((v) => ({ ...v, recipient: e.target.value }))}
                placeholder="e.g. Dr. Smith, my manager, hello@acme.com" disabled={disabled} />
            </Field>
            <Field label="Subject (optional)">
              <Input value={values.subject} onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
                placeholder="Leave blank to have AI suggest one" disabled={disabled} />
            </Field>
            <Field label="Purpose">
              <Input value={values.purpose} onChange={(e) => setValues((v) => ({ ...v, purpose: e.target.value }))}
                placeholder="What is this email for?" disabled={disabled} />
            </Field>
            <Field label="Key points">
              <Textarea rows={5} value={values.keyPoints}
                onChange={(e) => setValues((v) => ({ ...v, keyPoints: e.target.value }))}
                placeholder="One point per line…" disabled={disabled} />
            </Field>
            <Field label="Tone">
              <Select value={values.tone} onValueChange={(t) => setValues((v) => ({ ...v, tone: t as EmailValues["tone"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
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
