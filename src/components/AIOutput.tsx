import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, RefreshCw, Download, Trash2, Pencil, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveDoc, pushHistory } from "@/lib/history";

type Props = {
  content: string;
  loading?: boolean;
  toolName: string;
  title?: string;
  onRegenerate?: () => void;
  onClear?: () => void;
};

export function AIOutput({ content, loading, toolName, title, onRegenerate, onClear }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  const copy = async () => {
    await navigator.clipboard.writeText(editing ? draft : content);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([editing ? draft : content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || toolName).toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const save = () => {
    const item = pushHistory({ tool: toolName, title: title || toolName, content: editing ? draft : content });
    saveDoc(item);
    toast.success("Saved to your documents");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-gradient-to-r from-primary to-accent px-3 text-xs font-semibold text-primary-foreground">
            AI Output
          </span>
          {loading && <span className="text-xs text-muted-foreground animate-pulse">Generating…</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)} disabled={!content}>
            {editing ? <Check className="mr-1 h-4 w-4" /> : <Pencil className="mr-1 h-4 w-4" />}
            {editing ? "Done" : "Edit"}
          </Button>
          <Button size="sm" variant="ghost" onClick={copy} disabled={!content}>
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
          {onRegenerate && (
            <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={loading}>
              <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={download} disabled={!content}>
            <Download className="mr-1 h-4 w-4" /> Download
          </Button>
          <Button size="sm" variant="ghost" onClick={save} disabled={!content}>
            <Star className="mr-1 h-4 w-4" /> Save
          </Button>
          {onClear && (
            <Button size="sm" variant="ghost" onClick={onClear} disabled={!content}>
              <Trash2 className="mr-1 h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {!content && !loading && (
        <p className="text-sm text-muted-foreground">Your AI-generated response will appear here.</p>
      )}
      {loading && !content && (
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      )}
      {editing ? (
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[280px] font-mono text-sm" />
      ) : (
        content && (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-0.5">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )
      )}
    </div>
  );
}
