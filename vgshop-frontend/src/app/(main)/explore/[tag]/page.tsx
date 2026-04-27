"use client";

import useSWR from "swr";
import { use } from "react";
import { BigGameCarousel } from "@/components/BigGameCarousel/BigGameCarousel";
import { Game } from "@/components/GameAddModal/GameAddModal";
import GameList from "@/components/GameList/GameList";

interface Props {
  params: Promise<{ tag: string }>;
}

interface GameResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}

export default function TagPage({ params }: Props) {
  const tagName = use(params).tag;

  const {
    data: dataCarousel,
    error: errC,
    isLoading: loadingC,
  } = useSWR<Game[]>(`/games/catalogue/recent?tag_list=${tagName}`);

  return (
    <div className="space-y-12">
      <h2 className="uppercase text-5xl text-center font-bold">{tagName}</h2>

      <BigGameCarousel
        params={{ games: dataCarousel, error: errC, isLoading: loadingC }}
      />

      <div className="mt-6">
        <h2 className="uppercase text-2xl font-bold mb-4">
          I giochi del nostro catalogo: {tagName}
        </h2>

        <GameList params={{ query: `tag_list=${tagName}` }} />
      </div>
    </div>
  );
}
