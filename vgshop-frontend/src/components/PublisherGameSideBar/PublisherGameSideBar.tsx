"use client";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Gamepad2, Library, Inbox, ChevronDown } from "lucide-react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assicurati di averlo installato: npx shadcn@latest add scroll-area
import { Badge } from "../ui/badge";



export function PublisherGameSidebar({ className }: { className?: string }) {
  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
  } = useSWR<string[]>(`/games/publisher_dashboard/`);

  
  const hasGames = gameData && gameData.length > 0;
  

  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg tracking-tight">Pannello di controllo</h2>
          <Badge className="mx-auto text-white text-md p-3 bg-zinc-600">
            {(gameData?.length || 0)}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4" asChild>
                <CollapsibleTrigger>
                  I tuoi titoli{" "}
                  <ChevronDown className="-rotate-90 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-0" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  {gameIsLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground">
                      <Spinner />
                      <span className="text-xs">Caricamento...</span>
                    </div>
                  ) : gameError ? (
                    <div className="p-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md mx-4">
                      Errore nel caricamento
                    </div>
                  ) : !hasGames ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <Inbox className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Nessun gioco qui.</p>
                    </div>
                  ) : (
                    <SidebarMenu className="px-2">
                      {gameData?.map((title, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton asChild tooltip={title}>
                            <Link href={`/publisher_control/${title}`}>
                              <Gamepad2 className="w-4 h-4 shrink-0" />
                              <span className="truncate">{title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
