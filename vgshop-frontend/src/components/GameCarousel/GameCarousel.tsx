"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useSWR from "swr";

import { Game, Tag, GameImage } from "../GameAddModal/GameAddModal";
import { Separator } from "../ui/separator";

export function GameCarousel() {
  const {
    data: games,
    error,
    isLoading,
  } = useSWR<[Game | undefined]>(() => {
    const end = new Date();
    const start = new Date();
    end.setDate(end.getDate() - 30);

    // Formattiamo entrambe le date
    const dateEnd = end.toISOString().split("T")[0]; // Oggi
    const dateStart = start.toISOString().split("T")[0]; // 30 giorni fa

    return `games/catalogue/?release_date__gte=${dateEnd}&release_date__lte=${dateStart}`;
  });

  return (
    <Carousel
      className="sm:max-w-xs "
      style={{ maxWidth: "90%", margin: "0 auto" }}
    >
      <CarouselContent>
        {games
          ?.filter((game): game is Game => !!game)
          .map((game: Game) => (
            <CarouselItem key={game.id}>
              <div className="p-4">
                <Card className="overflow-hidden p-0 ">
                  <CardContent className="p-0" style={{ height: "20rem" }}>
                    <div className="flex flex-row w-full h-full">
                      <div className="shrink-0 h-full" style={{ width: "60%" }}>
                        <img
                          src={game.images[0]?.image}
                          alt={game.title}
                          className="w-full h-full object-cover "
                        />
                      </div>

                      <div className="flex flex-col justify-center w-full px-4">
                        {/* Sezione Titolo + Prezzo */}
                        <div
                          className="flex items-baseline"
                          style={{ gap: "10rem" }}
                        >
                          <h1 className="text-4xl font-bold shrink-0">
                            {game.title}
                          </h1>
                          <span className="text-4xl font-medium">
                            {game.price === 0 ? "Gratis" : `${game.price}€`}
                          </span>
                        </div>

                        <Separator className="mt-6" />
                        {game.images && game.images.length > 0 && (
                          <div
                            className="flex flex-row justify-center mt-6 w-full "
                            style={{ gap: "3rem" }}
                          >
                            {game.images.slice(0, 2).map((img) => (
                              <div
                                key={img.id}
                                className="relative overflow-hidden rounded-md border"
                                style={{
                                  height: "6rem",
                                  width: "10rem",
                                  borderRadius: "0.5rem",
                                }}
                              >
                                <img
                                  src={img.image}
                                  alt="game preview"
                                  className="object-cover w-full h-full "
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Riga Inferiore: Lista dei Tag */}
                        <div className="flex flex-wrap gap-2 mt-6">
                          {game.tag_list?.map((tag) => (
                            <span
                              key={tag.name}
                              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full border"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
