"use client";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useSWR from "swr";
import { Spinner } from "@/components/ui/spinner";
import GameInfo from "@/components/GameInfo/GameInfo";
import { Game } from "@/components/GameAddModal/GameAddModal";
import { use } from "react";
import Link from "next/link";

interface Props {
  params: Promise<{ title: string }>;
}

export default function Library({ params }: Props) {
  const title = use(params).title;

  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
  } = useSWR(title ? `/api/family/dashboard/games/${title}` : null);

  if (gameIsLoading) return <Spinner />;
  if (!title || gameError || !gameData) {
    return (
      <>
        <div className="max-w-7xl flex-1 mx-auto p-4">
          <h2 className="uppercase text-4xl font-bold">I tuoi giochi</h2>
          <div className="flex-1">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Non hai nessun gioco nella tua libreria</EmptyTitle>
                <EmptyDescription>
                  Acquista un gioco per vederlo qui. Visita il nostro catalogo
                  per scoprire i giochi disponibili.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Link href={"/explore/"}>
                  <Button>Esplora il catalogo</Button>
                </Link>
              </EmptyContent>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-full flex-1 mx-0 p-0">
        <GameInfo
          params={{
            game: gameData.game,
            error: gameError,
            isLoading: gameIsLoading,
          }}
        />
      </div>
    </>
  );
}
