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

export function GameGridCarousel() {
  const { data: games, error, isLoading } = useSWR<Game[]>("games/catalogue"); // Tipizzato come array di Game

  // Gestione caricamento ed errori
  if (isLoading) return <div className="text-center">Caricamento...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">
        Errore nel caricamento dei giochi
      </div>
    );

  // Funzione per raggruppare i games a blocchi di 6
  // Usiamo un fallback all'array vuoto se games non è ancora disponibile
  const itemsToProcess = games ?? [];
  const chunkedItems = [];

  for (let i = 0; i < itemsToProcess.length; i += 6) {
    chunkedItems.push(itemsToProcess.slice(i, i + 6));
  }

  return (
    <Carousel style={{ width: "90%", margin: "0 auto" }}>
      <CarouselContent>
        {chunkedItems.map((group, index) => (
          <CarouselItem key={index}>
            <div className="grid grid-cols-3 grid-rows-2 gap-4 p-1">
              {group.map((game) => (
                <Card
                  key={game.id} // Aggiunta la chiave univoca
                  className="relative mx-auto w-full"
                  style={{ paddingTop: 0 }}
                >
                  <img
                    src={game.cover || "https://avatar.vercel.sh/shadcn1"} // Dinamico
                    alt={game.title}
                    className="relative z-20 w-full object-cover"
                    style={{ maxHeight: "15rem" }}
                  />
                  <CardHeader>
                    <CardAction>
                      <Button className="w-full text-xs">Visualizza</Button>
                    </CardAction>
                    <CardTitle className="truncate text-lg">
                      {game.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
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
