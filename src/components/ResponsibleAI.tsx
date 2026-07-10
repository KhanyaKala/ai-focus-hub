import { ShieldAlert } from "lucide-react";

export function ResponsibleAI() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-xs text-amber-900 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-100">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Responsible AI:</span> AI-generated content is designed to assist students and
        professionals but may occasionally contain inaccuracies. Always review, edit, and verify important information
        before submitting assignments, sending emails, making decisions, or using the generated content professionally.
        You remain responsible for all final content.
      </p>
    </div>
  );
}
