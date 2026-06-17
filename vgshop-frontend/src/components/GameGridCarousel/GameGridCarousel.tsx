import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { GameCard } from "../GameCard/GameCard";
import { Button } from "../ui/button";
import { Game } from "../GameAddModal/GameAddModal";
import useSWR from "swr";
import Image from "next/image";
import { Spinner } from "../ui/spinner";

interface Props {
  params: {
    games: Game[] | undefined;
    error: string;
    isLoading: boolean;
    game_per_page?: number;
  };
}

export function GameGridCarousel({ params }: Props) {
  if (params.isLoading) return <Spinner />;
  if (params.error)
    return (
      <div className="text-center text-red-500">
        Errore nel caricamento dei giochi
      </div>
    );
  if (params.games?.length == 0 || !params.games)
    return <p>Nessun Gioco disponibile.</p>;

  return (
    <div className={`grid grid-cols-5  "grid-rows-2" gap-2 gap-y-3 p-4`}>
      {params.games.map((game) => (
        <GameCard key={game.id} params={{ game }} />
      ))}
    </div>
  );
}
