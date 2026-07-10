import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarClock,
  CalendarDays,
  Search,
  MessageSquare,
  History,
  BookmarkCheck,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/lib/role-context";

const aiTools = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Smart Email Generator", url: "/email", icon: Mail },
  { title: "Notes Summariser", url: "/notes", icon: FileText },
  { title: "AI Task Planner", url: "/planner", icon: CalendarClock },
  { title: "AI Research Assistant", url: "/research", icon: Search },
  { title: "AI Chatbot", url: "/chat", icon: MessageSquare },
];

const library = [
  { title: "History", url: "/history", icon: History },
  { title: "Saved Documents", url: "/saved", icon: BookmarkCheck },
];

const support = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, setRole } = useRole();

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const renderItems = (items: typeof aiTools) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = isActive(item.url, item.exact);
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
              <Link
                to={item.url}
                className={
                  active
                    ? "!bg-gradient-to-r !from-primary/15 !to-accent/15 !text-primary font-medium"
                    : ""
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">Productivity Hub</div>
              <div className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                AI Assistant
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(aiTools)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(library)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(support)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && role && (
          <div className="mx-3 mt-2 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mode
            </div>
            <div className="mt-0.5 text-sm font-bold capitalize">{role}</div>
            <button
              className="mt-2 text-xs font-medium text-primary hover:underline"
              onClick={() => setRole(null)}
            >
              Switch role
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
