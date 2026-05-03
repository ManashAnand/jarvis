import { useState } from "react";
import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  Search,
  Trash2,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string; // already-formatted label like "2h ago"
  group: "Today" | "Yesterday" | "Previous 7 days" | "Older";
};

const SAMPLE_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Plan a weekend in Kyoto", updatedAt: "2h ago", group: "Today" },
  { id: "2", title: "Refactor auth flow", updatedAt: "5h ago", group: "Today" },
  { id: "3", title: "Birthday gift ideas for mom", updatedAt: "1d ago", group: "Yesterday" },
  { id: "4", title: "Tailwind v4 migration notes", updatedAt: "3d ago", group: "Previous 7 days" },
  { id: "5", title: "Resume bullet rewrites", updatedAt: "5d ago", group: "Previous 7 days" },
  { id: "6", title: "Recipe: miso glazed salmon", updatedAt: "2w ago", group: "Older" },
];

const GROUP_ORDER: Conversation["group"][] = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Older",
];

export function AppSidebar() {
  const [activeId, setActiveId] = useState<string>("1");
  const [query, setQuery] = useState("");

  const filtered = SAMPLE_CONVERSATIONS.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-red-500">
      <div className="flex h-full flex-col bg-sidebar/60 backdrop-blur-xl">
        <SidebarHeader className="gap-3 px-3 pt-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">Jarvis</span>
              <span className="text-[11px] text-sidebar-foreground/60">Personal AI</span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="h-8 border-sidebar-border bg-sidebar-accent/40 pl-8 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:ring-sidebar-ring"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1">
          {GROUP_ORDER.map((group) => {
            const items = filtered.filter((c) => c.group === group);
            if (items.length === 0) return null;

            return (
              <SidebarGroup key={group}>
                <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
                  {group}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((c) => {
                      const isActive = c.id === activeId;
                      return (
                        <SidebarMenuItem key={c.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setActiveId(c.id)}
                            className="group/item h-9 gap-2 text-sidebar-foreground/80 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                          >
                            <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate text-sm">{c.title}</span>
                            <span className="ml-auto text-[10px] text-sidebar-foreground/40 group-hover/item:opacity-0">
                              {c.updatedAt}
                            </span>
                          </SidebarMenuButton>
                          <SidebarMenuAction
                            showOnHover
                            className="text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive"
                            aria-label="Delete chat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </SidebarMenuAction>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-sidebar-foreground/50">
              No chats found
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 px-2 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
