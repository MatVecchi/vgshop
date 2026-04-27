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
  if (params.games?.length == 0) return <p>Nessun Gioco disponibile.</p>;

  // Funzione per raggruppare i games a blocchi di 6
  // Usiamo un fallback all'array vuoto se games non è ancora disponibile
  const itemsToProcess = params.games ?? [];
  const chunkedItems = [];

  for (let i = 0; i < itemsToProcess.length; i += 6) {
    chunkedItems.push(itemsToProcess.slice(i, i + 6));
  }

  return (
    <Carousel style={{ width: "90%", margin: "0 auto" }}>
      <CarouselContent>
        {chunkedItems.map((group, index) => (
          <CarouselItem key={index}>
            <div className="grid grid-cols-4 grid-rows-2 gap-6 p-4">
              {group.map((game) => (
                <GameCard key={game.id} params={{ game }} />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
