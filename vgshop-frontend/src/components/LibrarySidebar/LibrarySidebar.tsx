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
  collection: string | null;
}

interface TitlesResponse {
  titles: GameTitleItem[];
}

interface FamilyTitlesResponse {
  titles: string[];
}

interface CollectionsGrouped {
  [key: string]: string[];
}

export function LibrarySidebar({ className }: { className?: string }) {
  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
    mutate,
  } = useSWR<TitlesResponse>(`/library/list_titles`);

  const {
    data: familyGameData,
    error: familyGameError,
    isLoading: familyGameIsLoading,
  } = useSWR<FamilyTitlesResponse>(`/api/family/dashboard/games/`);

  const hasGames = gameData?.titles && gameData.titles.length > 0;
  const hasFamilyGames =
    familyGameData?.titles && familyGameData.titles.length > 0;

  const collectionsGrouped: CollectionsGrouped = {};
  if (gameData?.titles) {
    gameData.titles.forEach((item) => {
      const colName = item.collection || "__none__";
      if (!collectionsGrouped[colName]) {
        collectionsGrouped[colName] = [];
      }
      collectionsGrouped[colName].push(item.title);
    });
  }

  const gamesMap = new Map();
  gameData?.titles.forEach((item) => gamesMap.set(item.title, true));
  familyGameData?.titles.forEach((title) => gamesMap.set(title, true));

  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg tracking-tight">Libreria</h2>
          <Badge className="mx-auto text-white text-md p-3 bg-zinc-600">
            {(gameData?.titles.length || 0) +
              (familyGameData?.titles.length || 0)}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {Object.entries(collectionsGrouped).map(
            ([collectionName, titles]) => (
              <Collapsible
                key={collectionName}
                defaultOpen
                className="group/collapsible"
              >
                <SidebarGroup className="w-full min-w-0 overflow-hidden">
                  <SidebarGroupLabel className="px-4" asChild>
                    <CollapsibleTrigger>
                      {collectionName === "__none__"
                        ? "Senza Collezione"
                        : collectionName}{" "}
                      <ChevronDown className="-rotate-90 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-0" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent className="w-full min-w-0 overflow-hidden">
                    <SidebarGroupContent className="w-full min-w-0 overflow-hidden">
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
                        <SidebarMenu className="w-full min-w-0 overflow-hidden px-2">
                          {titles.map((title, index) => (
                            <SidebarMenuItem
                              key={index}
                              className="w-full min-w-0 overflow-hidden"
                            >
                              <SidebarMenuButton
                                asChild
                                tooltip={title}
                                className="w-full min-w-0 overflow-hidden"
                              >
                                <Tooltip>
                                  <TooltipTrigger>
                                    <ContextMenu>
                                      <ContextMenuTrigger>
                                        {" "}
                                        <Link
                                          href={`/library/${title}`}
                                          className="flex items-center gap-2 w-full min-w-0 pr-8"
                                        >
                                          <Gamepad2 className="w-4 h-4 shrink-0" />
                                          <span className="truncate">
                                            {title}
                                          </span>
                                        </Link>
                                      </ContextMenuTrigger>
                                      <ContextMenuContent>
                                        <ContextMenuItem asChild>
                                          <Dialog>
                                            <DialogTrigger>
                                              Gestisci collezione
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>
                                                  Assegna il gioco ad una
                                                  collezione
                                                </DialogTitle>
                                                <DialogDescription>
                                                  Assegna il gioco ad una
                                                  collezione già esistente
                                                  oppure creane una nuova
                                                </DialogDescription>
                                              </DialogHeader>
                                              <Separator />
                                              <CollectionDialog
                                                title={title}
                                                collections={Object.keys(
                                                  collectionsGrouped,
                                                )}
                                                ownCollection={collectionName}
                                                onCollectionChanged={() =>
                                                  mutate()
                                                }
                                              />
                                            </DialogContent>
                                          </Dialog>
                                        </ContextMenuItem>
                                      </ContextMenuContent>
                                    </ContextMenu>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      )}
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ),
          )}

          {hasFamilyGames ? (
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup className="w-full min-w-0 overflow-hidden">
                <SidebarGroupLabel className="px-4" asChild>
                  <CollapsibleTrigger>
                    Giochi condivisi{" "}
                    <ChevronDown className="-rotate-90 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-0" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="w-full min-w-0 overflow-hidden">
                  <SidebarGroupContent className="w-full min-w-0 overflow-hidden">
                    {familyGameIsLoading ? (
                      <div className="flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground">
                        <Spinner />
                        <span className="text-xs">Caricamento...</span>
                      </div>
                    ) : familyGameError ? (
                      <div className="p-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md mx-4">
                        Errore nel caricamento
                      </div>
                    ) : (
                      <SidebarMenu className="px-2 w-full min-w-0 overflow-hidden">
                        {familyGameData?.titles.map((title, index) => (
                          <SidebarMenuItem
                            key={index}
                            className="w-full min-w-0 overflow-hidden"
                          >
                            <SidebarMenuButton
                              asChild
                              tooltip={title}
                              className="w-full min-w-0 overflow-hidden"
                            >
                              <Link
                                href={`/library/family/${title}`}
                                className="flex items-center gap-2 w-full min-w-0 pr-8"
                              >
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
          ) : (
            <></>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
