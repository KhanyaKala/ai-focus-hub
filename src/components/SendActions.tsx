import { Mail, ExternalLink, MessageSquare } from "lucide-react";

/** Strips markdown formatting from the AI output for cleaner email/message body. */
function stripMarkdown(md: string) {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)")
    .trim();
}

/** Extract a subject line from the first heading in the output. */
function extractSubject(md: string, fallback: string) {
  const heading = md.match(/^#{1,6}\s+(.+)$/m);
  if (heading) return heading[1].replace(/^Subject:\s*/i, "").trim();
  const subjectLine = md.match(/^Subject:\s*(.+)$/im);
  if (subjectLine) return subjectLine[1].trim();
  return fallback;
}

/** Extract body — strip the subject heading if present. */
function extractBody(md: string) {
  const text = stripMarkdown(md);
  return text.replace(/^Subject:\s*.+\n+/i, "").trim();
}

type Props = {
  output: string;
  recipient?: string;
  fallbackSubject?: string;
};

export function SendActions({ output, recipient = "", fallbackSubject = "" }: Props) {
  const subject = extractSubject(output, fallbackSubject || "Message");
  const body = extractBody(output);
  const to = recipient.includes("@") ? recipient : "";

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const encodedTo = encodeURIComponent(to);

  const mailto = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  const outlookWeb = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
  const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
  // Teams doesn't accept deep-link message body reliably, but we can pre-fill a chat with the message.
  const teams = `https://teams.microsoft.com/l/chat/0/0?users=&message=${encodedBody}`;

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground/85 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary";

  return (
    <div className="mt-3 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Send this
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={outlookWeb} target="_blank" rel="noopener noreferrer" className={btn}>
          <Mail className="h-3.5 w-3.5" /> Outlook Web
        </a>
        <a href={gmailWeb} target="_blank" rel="noopener noreferrer" className={btn}>
          <Mail className="h-3.5 w-3.5" /> Gmail
        </a>
        <a href={mailto} className={btn}>
          <ExternalLink className="h-3.5 w-3.5" /> Default mail app
        </a>
        <a href={teams} target="_blank" rel="noopener noreferrer" className={btn}>
          <MessageSquare className="h-3.5 w-3.5" /> Send in Teams
        </a>
        <a
          href="https://outlook.office.com"
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open Outlook
        </a>
        <a
          href="https://teams.microsoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open Teams
        </a>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Opens the compose window with your subject and body pre-filled. Sign in to Microsoft when prompted.
      </p>
    </div>
  );
}
