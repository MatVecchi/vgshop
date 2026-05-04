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
import { Gamepad2, Library, Inbox } from "lucide-react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assicurati di averlo installato: npx shadcn@latest add scroll-area
import { Badge } from "../ui/badge";

interface TitlesResponse {
  titles: string[];
}

export function LibrarySidebar({ className }: { className?: string }) {
  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
  } = useSWR<TitlesResponse>(`/library/list_titles`);

  const hasGames = gameData?.titles && gameData.titles.length > 0;

  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg tracking-tight">Libreria</h2>
          <Badge className="mx-auto text-white text-md p-3 bg-zinc-600">
            {gameData?.titles.length || 0}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">
              I tuoi titoli
            </SidebarGroupLabel>
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
                  {gameData?.titles.map((title, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild tooltip={title}>
                        <Link href={`/library/${title}`}>
                          <Gamepad2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="text-[10px] text-muted-foreground text-center">
          Totale giochi:
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
