import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, Trash2, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useEffect, useRef, useState } from "react";
import { useLocalState, uid, type ChatMessage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { useRole, roleContextLine } from "@/lib/role-context";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ResponsibleAI } from "@/components/ResponsibleAI";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot | Productivity Hub AI" },
      { name: "description", content: "Chat with a role-aware AI assistant for study, work, planning, and ideas." },
      { property: "og:title", content: "AI Chatbot | Productivity Hub AI" },
      { property: "og:description", content: "Chat with a role-aware AI assistant for study, work, planning, and ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const STUDENT_PROMPTS = [
  "Write an email to my lecturer.",
  "Summarise these lecture notes.",
  "Plan my study timetable.",
  "Explain this topic simply.",
  "Help me prepare for an interview.",
  "Prioritise my tasks.",
  "Suggest ideas for my presentation.",
];
const PRO_PROMPTS = [
  "Write an email to my manager.",
  "Summarise today's meeting.",
  "Plan my work week.",
  "Draft a project update.",
  "Prep me for a client meeting.",
  "Prioritise my tasks.",
  "Suggest ideas for my presentation.",
];

function ChatPage() {
  const { role } = useRole();
  const [messages, setMessages] = useLocalState<ChatMessage[]>("phai:chat", []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const generate = useServerFn(generateAI);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [sending]);

  const suggestions = role === "professional" ? PRO_PROMPTS : STUDENT_PROMPTS;

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const system = `You are Productivity Hub AI — a friendly, capable assistant that helps users plan, learn, write, and think clearly. Respond in concise, well-formatted Markdown. Ask clarifying questions only when strictly necessary.\n\n${roleContextLine(role)}`;
      const res = await generate({
        data: {
          system,
          messages: next.map(({ role: r, content: c }) => ({ role: r, content: c })),
        },
      });
      setMessages([...next, { id: uid(), role: "assistant", content: res.text, ts: Date.now() }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg.includes("402") ? "AI credits exhausted. Add credits in workspace billing." : "Failed to reach AI.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      title="AI Chatbot"
      description="Ask anything — planning, writing, brainstorming, or learning."
      icon={<MessageSquare className="h-5 w-5" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => setMessages([])} disabled={messages.length === 0}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="glass-card flex h-[65vh] flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">How can I help you today?</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Try one of these suggestions or type your own question.
                </p>
                <div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
                  </span>
                  Thinking…
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-border/60 bg-card/60 p-3 md:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Message Productivity Hub AI…"
                rows={2}
                className="resize-none"
                disabled={sending}
              />
              <Button
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Press Enter to send · Shift+Enter for newline
            </div>
          </div>
        </div>
        <ResponsibleAI />
      </div>
    </PageShell>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  const time = new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-accent px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          {m.content}
        </div>
        <span className="mt-1 pr-1 text-[10px] text-muted-foreground">{time}</span>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5">
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}
