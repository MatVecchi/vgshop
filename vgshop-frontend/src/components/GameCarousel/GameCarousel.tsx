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
import { Spinner } from "../ui/spinner";
import { Game, Tag, GameImage } from "../GameAddModal/GameAddModal";
import { Separator } from "../ui/separator";
import ReactPlayer from "react-player";
import Image from "next/image";

interface Props {
  params: {
    games: Game[] | undefined;
    error: string;
    isLoading: boolean;
  };
}

export function GameCarousel({ params }: Props) {
  if (params.isLoading) return <Spinner />;
  if (params.error)
    return (
      <div className="text-center text-red-500">
        Errore nel caricamento dei giochi
      </div>
    );
  if (params.games?.length == 0) return <p>Nessun Gioco disponibile.</p>;

  return (
    <Carousel
      className="sm:max-w-xs "
      style={{ maxWidth: "90%", margin: "0 auto" }}
    >
      <CarouselContent>
        {params.games
          ?.filter((game): game is Game => !!game)
          .map((game: Game) => (
            <CarouselItem key={game.id}>
              <div className="p-4">
                <Card className="overflow-hidden p-0 ">
                  <CardContent className="p-0" style={{ height: "20rem" }}>
                    <div className="flex flex-row w-full h-full">
                      <div
                        className="relative shrink-0 h-full"
                        style={{ width: "60%" }}
                      >
                        <Image
                          src={game.images[0]?.image}
                          alt={game.title}
                          fill
                          className="object-cover"
                          loading="eager"
                        />
                      </div>

                      <div className="flex flex-col justify-center w-full px-4">
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
                                className="relative overflow-hidden border"
                                style={{
                                  height: "6rem",
                                  width: "10rem",
                                  borderRadius: "0.5rem",
                                }}
                              >
                                <Image
                                  src={img.image}
                                  alt="game preview"
                                  fill
                                  className="object-cover"
                                  sizes="160px" // 10rem sono 160px, aiuta l'ottimizzazione
                                  loading="eager"
                                />
                              </div>
                            ))}
                          </div>
                        )}

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
