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
      }}
      className=""
      style={{ width: "90%", margin: "0 auto" }}
    >
      <CarouselContent>
        {tag_list.map((tag: Tag) => (
          <CarouselItem key={tag.name} style={{ flexBasis: "25%" }}>
            <div className="p-3">
              <Card
                style={{
                  background: "#5a189a",
                  border: "None",
                  boxShadow: "None",
                }}
              >
                <Link href={`/explore/${tag.name}`}>
                  <CardContent
                    className="flex items-center justify-center p-8"
                    style={{ height: "8rem" }}
                  >
                    <span
                      className="text-4xl font-semibold"
                      style={{ color: "#e5ecf4" }}
                    >
                      {tag.name}
                    </span>
                  </CardContent>
                </Link>
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
