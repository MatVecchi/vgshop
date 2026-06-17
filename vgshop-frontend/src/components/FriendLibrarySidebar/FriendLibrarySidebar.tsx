"use client";

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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { Gamepad2, Library, Inbox, ChevronDown } from "lucide-react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assicurati di averlo installato: npx shadcn@latest add scroll-area
import { Badge } from "../ui/badge";
import CollectionDialog from "../CollectionDialog/CollectionDialog";
import { Button } from "../ui/button";

interface GameTitleItem {
  title: string;
  collection: string;
}

interface TitlesResponse {
  titles: GameTitleItem[];
}

interface CollectionsGrouped {
  [key: string]: string[];
}

export default function FriendLibrarySidebar({ id, className }: { id: number; className?: string }) {
  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
  } = useSWR<TitlesResponse>(`/friend/${id}/list_titles`);

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
            <SidebarGroup className="w-full min-w-0 overflow-hidden">
                <SidebarGroupContent className="w-full min-w-0 overflow-hidden">
                    <SidebarMenu className="w-full min-w-0 overflow-hidden px-2">
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
                    ) : gameData?.titles.map(
                        (item, index) => (
                        
                            <SidebarMenuItem
                              key={index}
                              className="w-full min-w-0 overflow-hidden"
                            >
                              <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className="w-full min-w-0 overflow-hidden"
                              >
                                <Tooltip>
                                  <TooltipTrigger>
                                        <Link
                                          href={`/friend/${id}/${item.title}/`}
                                          className="flex items-center gap-2 w-full min-w-0 pr-8"
                                        >
                                          <Gamepad2 className="w-4 h-4 shrink-0" />
                                          <span className="truncate">
                                            {item.title}
                                          </span>
                                        </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{item.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
