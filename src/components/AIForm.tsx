import { useState, type ReactNode } from "react";
import { generateAI } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { AIOutput } from "@/components/AIOutput";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { pushHistory } from "@/lib/history";
import { useRole, roleContextLine } from "@/lib/role-context";

export type AIFormRenderProps<T> = {
  values: T;
  setValues: (updater: (v: T) => T) => void;
  disabled: boolean;
};

type Props<T> = {
  toolName: string;
  initialValues: T;
  systemPrompt: string;
  buildUserPrompt: (values: T, role: string) => string;
  validate?: (values: T) => string | null;
  outputTitle?: (values: T) => string;
  children: (p: AIFormRenderProps<T>) => ReactNode;
  submitLabel?: string;
  examples?: { student?: string[]; professional?: string[] };
  onFillExample?: (example: string, setValues: (u: (v: T) => T) => void) => void;
};

export function AIForm<T extends Record<string, unknown>>({
  toolName,
  initialValues,
  systemPrompt,
  buildUserPrompt,
  validate,
  outputTitle,
  children,
  submitLabel = "Generate with AI",
  examples,
  onFillExample,
}: Props<T>) {
  const { role } = useRole();
  const [values, setValuesState] = useState<T>(initialValues);
  const setValues = (updater: (v: T) => T) => setValuesState((prev) => updater(prev));
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  const roleExamples = role === "professional" ? examples?.professional : examples?.student;

  const run = async () => {
    const err = validate?.(values);
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      const roleLine = roleContextLine(role);
      const system = `${systemPrompt}\n\n${roleLine}\n\nAlways respond in clean, well-formatted Markdown. Be concise, organised, and actionable.`;
      const prompt = buildUserPrompt(values, role ?? "");
      const res = await generate({ data: { system, prompt } });
      setOutput(res.text);
      pushHistory({ tool: toolName, title: outputTitle?.(values) || toolName, content: res.text });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg.includes("402") ? "AI credits exhausted. Add credits in workspace billing." : "Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="glass-card p-5">
          <div className="space-y-4">{children({ values, setValues, disabled: loading })}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={run}
              disabled={loading}
              className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-md hover:opacity-95"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              {loading ? "Generating…" : submitLabel}
            </Button>
            <Button variant="ghost" onClick={() => setValuesState(initialValues)} disabled={loading}>
              Reset
            </Button>
          </div>

          {roleExamples && roleExamples.length > 0 && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Try an example
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roleExamples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => onFillExample?.(ex, setValues)}
                    className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        <AIOutput
          content={output}
          loading={loading}
          toolName={toolName}
          title={outputTitle?.(values)}
          onRegenerate={run}
          onClear={() => setOutput("")}
        />
        <ResponsibleAI />
      </div>
    </div>
  );
}
