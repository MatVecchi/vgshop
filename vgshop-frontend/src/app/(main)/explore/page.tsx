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

export default function Explore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center">
          <h2 className="uppercase text-4xl font-bold">Negozio</h2>

          <div className="flex flex-row gap-3">
            <CollapsibleTrigger asChild>
              <Button
                variant={isOpen ? "secondary" : "outline"}
                className="gap-2"
              >
                {isOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <ListFilter className="h-4 w-4" />
                )}
                Filtri Specifici
              </Button>
            </CollapsibleTrigger>

            <GameSearch />
            <Button type="submit">Cerca</Button>
          </div>
        </div>

        <CollapsibleContent className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="p-6">
            <GameFilters />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold">I più popolari</h2>
        <GameCarousel />
      </div>

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold">
          Esplora le nostra categorie
        </h2>
        <TagCarousel />
      </div>

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold">Uscite recenti</h2>
        <GameGridCarousel />
      </div>
    </div>
  );
}
