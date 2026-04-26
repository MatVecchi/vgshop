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

interface Props {
  params: {
    games: Game[] | undefined;
    error: string;
    isLoading: boolean;
  };
}

function getYouTubeEmbedUrl(url: string, origin: string): string {
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
      <div className="text-center text-red-500">
        Errore nel caricamento dei giochi
      </div>
    );
  if (params.games?.length === 0) return <p>Nessun Gioco disponibile.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto px-12 group">
      <Carousel
        className="sm:max-w-xs "
        style={{ maxWidth: "100%", margin: "0 auto" }}
      >
        <CarouselContent className="ml-0">
          {params.games
            ?.filter((game): game is Game => !!game)
            .map((game: Game) => (
              <CarouselItem key={game.id} className="p-4">
                <Card
                  className="p-0 overflow-hidden "
                  style={{ width: "90%", margin: "auto" }}
                >
                  <CardContent className="flex p-0" style={{ height: "460px" }}>
                    {/* Left 3/4 — YouTube video */}
                    <div className="w-3/4 h-full flex-shrink-0 bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(game.video, origin)}
                        title={`Trailer di ${game.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        style={{ border: "none", display: "block" }}
                      />
                    </div>

                    {/* Right 1/4 — details panel */}
                    <div className="w-1/4 flex flex-col bg-zinc-900 border-l border-zinc-800 overflow-hidden">
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video flex-shrink-0">
                        <Image
                          src={game.images[0]?.image || game.cover}
                          alt="Miniatura galleria"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>

                      {/* Testo sotto la thumbnail */}
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
                          <span className="text-2xl font-bold text-green-400">
                            {game.price === 0
                              ? "Gratis"
                              : `${game.price.toFixed(2)} €`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
