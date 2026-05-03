import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/component/app-sidebar";
import React from "react";

export function BaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden relative">
        {/* 1. The Sidebar */}
        <AppSidebar />

        {/* 2. Global Background (The Wallpaper) */}
        <div
          className="flex-1 flex flex-col relative bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{ backgroundImage: "url('/wallpaper.png')" }}
        >
          {/* 3. Global Overlay for all pages */}
          <div className="absolute inset-0 bg-[#020617]/20 z-0 backdrop-blur-[1px]" />

          {/* 4. The Content Area */}
          <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
            {/* Sidebar Trigger placed absolutely so it doesn't push the header */}
            <div className="absolute top-4 left-4 z-50">
              <SidebarTrigger className="text-white hover:bg-white/10" />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
