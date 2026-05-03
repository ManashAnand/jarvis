import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/component/app-sidebar";
import React from "react";

export function BaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-transparent">
      
      {/* FULL SCREEN BACKGROUND */}
      <div
        className="flex h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wallpaper.png')" }}
      >
        
        {/* ✅ SIDEBAR (separate layer) */}
        <AppSidebar />

        {/* ✅ MAIN CONTENT */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          
          {/* overlay */}
          <div className="absolute inset-0 bg-[#020617]/10 backdrop-blur-[1px]" />

          {/* ✅ TOGGLE BUTTON (outside sidebar) */}
          <div className="absolute top-4 left-4 z-50">
            <SidebarTrigger className="text-white hover:bg-white/10" />
          </div>

          {/* ✅ CHAT AREA */}
          <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
}