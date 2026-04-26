"use client";

import { ListFilter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameSearch } from "@/components/GameSearch/GameSearch";
import { GameFilters } from "@/components/GameFilters/GameFilters";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { GameCarousel } from "@/components/GameCarousel/GameCarousel";
import { TagCarousel } from "@/components/TagCarousel/TagCarousel";
import { GameGridCarousel } from "@/components/GameGridCarousel/GameGridCarousel";
import { GameCard } from "@/components/GameCard/GameCard";
import { Game } from "@/components/GameAddModal/GameAddModal";
import useSWR from "swr";
import { BigGameCarousel } from "@/components/BigGameCarousel/BigGameCarousel";

export default function Explore() {
  const {
    data: newGames,
    error: errorNewGames,
    isLoading: isLoadingNewGames,
  } = useSWR<Game[]>(`games/catalogue/recent/`);

  const {
    data: popularGames,
    error: errorPopularGames,
    isLoading: isLoadingPopularGames,
  } = useSWR<Game[]>("games/catalogue/recent");

  return (
    <div>
      <div>
        <h2 className="uppercase text-2xl font-bold">I più popolari</h2>
        <BigGameCarousel
          params={{
            games: newGames,
            error: errorNewGames,
            isLoading: isLoadingNewGames,
          }}
        />
      </div>

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold">
          Esplora le nostra categorie
        </h2>
        <TagCarousel />
      </div>

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold">Uscite recenti</h2>
        <GameGridCarousel
          params={{
            games: popularGames,
            error: errorPopularGames,
            isLoading: isLoadingPopularGames,
          }}
        />
      </div>
    </div>
  );
}
