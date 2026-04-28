"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Game } from "../GameAddModal/GameAddModal";
import { Spinner } from "../ui/spinner";
import {
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";

interface Props {
  params: {
    games: Game[] | undefined;
    error: string;
    isLoading: boolean;
  };
}

export function getYouTubeEmbedUrl(url: string, origin: string): string {
  try {
    const parsed = new URL(url);
    let videoId = "";
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else {
      videoId = parsed.searchParams.get("v") ?? "";
    }
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      ...(origin ? { origin } : {}),
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch {
    return url;
  }
}

export function BigGameCarousel({ params }: Props) {
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (params.isLoading) return <Spinner />;
  if (params.error)
    return (
      <div className="text-red-500 p-4 text-center">Errore: {params.error}</div>
    );

  if (!params.isLoading && params.games && params.games.length === 0) {
    return (
      <div className="flex justify-center mt-10">
        <EmptyHeader>
          <EmptyTitle>Nessun gioco trovato</EmptyTitle>
          <EmptyDescription>
            Non è stato trovato alcun gioco sulla base dei filtri inseriti.
          </EmptyDescription>
        </EmptyHeader>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-12 group">
      <Carousel
        className="sm:max-w-xs "
        style={{ maxWidth: "100%", margin: "0 auto" }}
      >
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-24 
                   bg-violet-600/50 rounded-[100%] blur-[40px] z-0"
          aria-hidden="true"
        ></div>
        <CarouselContent className="ml-0">
          {params.games
            ?.filter((game): game is Game => !!game)
            .map((game: Game) => (
              <CarouselItem key={game.id} className="p-4">
                <Link href={`game_info/${game.title}`}>
                  <Card
                    className="p-0 overflow-hidden duration-300 group-hover:scale-105"
                    style={{ width: "90%", margin: "auto" }}
                  >
                    <CardContent
                      className="flex p-0"
                      style={{ height: "460px" }}
                    >
                      <div className="w-3/4 h-full flex-shrink-0 bg-black ">
                        <iframe
                          src={getYouTubeEmbedUrl(game.video, origin)}
                          title={`Trailer di ${game.title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          style={{ border: "none", display: "block" }}
                        />
                      </div>

                      <div className="w-1/4 flex flex-col bg-zinc-900 border-l border-zinc-800 overflow-hidden">
                        <div className="relative w-full aspect-video flex-shrink-0">
                          <Image
                            src={game.images[0]?.image || game.cover}
                            alt="Miniatura galleria"
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>

                        <div className="flex flex-col flex-1 justify-between p-4 overflow-hidden">
                          <div className="space-y-2 overflow-hidden">
                            <h3 className="text-lg font-bold leading-snug line-clamp-2">
                              {game.title}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-6">
                              {game.tag_list?.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.name}
                                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full border"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>

                            <p className="text-sm text-zinc-400 line-clamp-4 leading-relaxed">
                              {game.description}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 pt-3 border-t border-zinc-800">
                            <span className="text-xs text-zinc-500">
                              Rilascio:{" "}
                              {new Date(game.release_date).toLocaleDateString(
                                "it-IT",
                              )}
                            </span>
                            <span className="text-gray-900 w-min bg-white p-1 rounded-lg text-lg font-bold whitespace-nowrap">
                              {game.price === 0
                                ? "Gratis"
                                : `${game.price.toFixed(2)} €`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
