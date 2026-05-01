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
import Link from "next/link";
import { Spinner } from "../ui/spinner";
import { Tag } from "lucide-react";

type Tag = {
  name: string;
};

export function TagCarousel() {
  const {
    data: tag_list,
    error,
    isLoading: isTagListLoading,
  } = useSWR<Tag[]>("/games/catalogue/tag_list/");

  if (isTagListLoading) return <Spinner />;
  if (error) return <p>Errore nel caricamento dei tag.</p>;
  if (!tag_list?.length) return <p>Nessun tag disponibile.</p>;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-[90%] mx-auto"
    >
      <CarouselContent className="-ml-4">
        {tag_list.map((tag: Tag) => (
          <CarouselItem
            key={tag.name}
            className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 "
          >
            <div className="p-2">
              <Link href={`/explore/${tag.name}`}>
                <Card className="group relative overflow-hidden border-none transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/20 bg-gradient-to-br from-[#5a189a] to-[#3c096c]">
                  <div className="absolute h-full inset-0 bg-gradient-to-br from-[#7b2cbf] via-[#9d4edd] to-[#5a189a] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                  <CardContent className="relative flex items-center justify-center p-6 h-32  transition-all duration-500">
                    <span className="relative z-10 text-xl md:text-2xl font-extrabold tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                      {tag.name}
                    </span>

                    <Tag className="absolute -right-2 -bottom-2 h-16 w-16 text-white/10 group-hover:text-white/20 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Posizionamento migliorato delle frecce */}
      <CarouselPrevious className="-left-12 hidden md:flex" />
      <CarouselNext className="-right-12 hidden md:flex" />
    </Carousel>
  );
}
