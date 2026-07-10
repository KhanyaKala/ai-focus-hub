import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageShell({
  title,
  description,
  icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
        <SidebarTrigger />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 flex-1 min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight md:text-xl">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground md:text-sm">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
