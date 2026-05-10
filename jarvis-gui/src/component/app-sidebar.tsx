
import { useState } from "react";
import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  Search,
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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ConversationGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older";

interface Conversation {
  id: string;
  title: string;
  group: ConversationGroup;
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Plan a weekend in Kyoto", group: "Today" },
  { id: "2", title: "Refactor auth flow", group: "Today" },
  { id: "3", title: "Birthday gift ideas", group: "Yesterday" },
];

const GROUP_ORDER: ConversationGroup[] = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Older",
];

export function AppSidebar() {
  const [activeId, setActiveId] = useState<string>("1");
  const [query, setQuery] = useState<string>("");

  const filtered = SAMPLE_CONVERSATIONS.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
<Sidebar
  className="border-r border-white/10 bg-transparent [&>*]:bg-transparent backdrop-blur-xl"
>
      {/* Glass container */}
      <div className="flex h-full flex-col bg-white/5 backdrop-blur-2xl shadow-[4px_0_30px_rgba(0,0,0,0.4)]">

        {/* HEADER */}
        <SidebarHeader className="gap-4 px-4 pt-6 bg-transparent">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white tracking-tight">
                Jarvis
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-300/80">
                Intelligence Hub
              </span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full justify-start gap-2 bg-white/10 text-white border border-white/10 hover:bg-emerald-500/20 transition-all"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="text-xs font-medium">New session</span>
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 border-white/10 bg-white/10 pl-9 text-sm text-white placeholder:text-white/40 focus-visible:ring-emerald-500/30"
            />
          </div>
        </SidebarHeader>

        {/* CONTENT */}
        <SidebarContent className="px-2 mt-4 bg-transparent">
          {GROUP_ORDER.map((group) => {
            const items = filtered.filter((c) => c.group === group);
            if (!items.length) return null;

            return (
              <SidebarGroup key={group} className="pb-4">
                <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/60 mb-2">
                  {group}
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {items.map((c) => {
                      const isActive = c.id === activeId;

                      return (
                        <SidebarMenuItem key={c.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setActiveId(c.id)}
                            className={`h-10 gap-3 px-3 rounded-lg transition-all ${
                              isActive
                                ? "bg-white/20 text-white border border-white/20 shadow-md"
                                : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <MessageSquare
                              className={`h-4 w-4 ${
                                isActive
                                  ? "text-emerald-400"
                                  : "opacity-40"
                              }`}
                            />
                            <span className="truncate text-sm font-medium">
                              {c.title}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="border-t border-white/10 bg-transparent px-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10 gap-3 px-3 text-white/60 hover:bg-white/10 hover:text-white rounded-lg transition-all">
                <Settings className="h-4 w-4 opacity-50" />
                <span className="text-sm font-medium">Core Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </div>
    </Sidebar>
  );
}