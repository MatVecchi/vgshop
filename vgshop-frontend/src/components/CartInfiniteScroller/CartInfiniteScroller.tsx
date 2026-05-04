"use client";

import { Virtuoso } from "react-virtuoso";
import useSWRInfinite from "swr/infinite";
import { Gamepad2, Trash2, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";
import { DialogClose } from "../ui/dialog";
import { Card } from "../ui/card";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { Game } from "../GameAddModal/GameAddModal";
import { toast } from "sonner";
import api from "@/lib/api";

const getKey = (pageIndex: any, previousPageData: any) => {
  if (pageIndex === 0) return `/shopping_cart/?page=1`;

  if (previousPageData && !previousPageData.next) {
    return null;
  }

  return `/shopping_cart/?page=${pageIndex + 1}`;
};

interface CartInfiniteScrollerProps {
  containerHeight?: string;
  cardClassName?: string;
  isDialog?: boolean;
}

export default function CartInfiniteScroller({
  isDialog = true,
  containerHeight = "500px",
  cardClassName = "h-36 max-w-md",
}: CartInfiniteScrollerProps) {
  const { data, size, setSize, isLoading, mutate } = useSWRInfinite(getKey);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const items = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.results || []);
  }, [data]);

  const handleRemove = async (id: string) => {
    setErrorMessage(""); // Resetta l'errore precedente

    try {
      const formData = new FormData();
      formData.append("pk", id);

      await api.delete(`shopping_cart/${id}/`);

      toast.success("Gioco rimosso dal carrello con successo !");
      mutate();
    } catch (e: any) {
      const errorData = e.response?.data;

      if (errorData) {
        const firstKey = Object.keys(errorData)[0];
        const message = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];

        setErrorMessage(message);
        toast.error(message);
      } else {
        setErrorMessage("Errore imprevisto dal server");
        toast.error("Errore imprevisto");
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (items.length === 0) {
    return (
      <div>
        <div className="flex-1">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Non hai nessun gioco nel carrello</EmptyTitle>
              <EmptyDescription>
                Esplora il nostro catalogo e aggiungi almeno un gioco al
                carrello !
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              {isDialog ? (
                <DialogClose asChild>
                  <Link href="/explore/">
                    <Button>Esplora il catalogo</Button>
                  </Link>
                </DialogClose>
              ) : (
                <Link href="/explore/">
                  <Button>Esplora il catalogo</Button>
                </Link>
              )}
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: containerHeight, width: "100%" }}>
      <Virtuoso
        data={items}
        endReached={() => {
          if (!isLoading) setSize(size + 1);
        }}
        // Come renderizzare ogni riga
        itemContent={(index, item) => (
          <Card
            className={`flex my-3 flex-row items-center p-3 gap-4 w-full shadow-none! border-zinc-800! ${cardClassName}`}
          >
            <div className="relative w-24 h-full shrink-0 overflow-hidden rounded-md">
              <Image
                src={item.game.cover}
                alt={item.game.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <div className="flex flex-col justify-between grow h-full py-1">
              <div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-xl leading-tight">
                    {item.game.title}
                  </h3>
                </div>

                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 ">
                  <span>{item.game.release_date}</span>
                  <span>•</span>
                  <span>{item.game.publisher}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive transition-colors px-2"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Rimuovi
                </Button>

                <div className="flex items-center gap-1 text-xl font-bold text-primary">
                  <Tag className="w-4 h-4" />
                  <span>{item.game.price} €</span>
                </div>
              </div>
            </div>
          </Card>
        )}
        components={{
          Footer: () => (isLoading ? <p>Caricamento...</p> : null),
        }}
      />

      <Separator className="my-3" />

      <div className="flex items-center gap-1 text-xl font-bold text-primary justify-end mt-2">
        Totale: {items.reduce((sum, item) => sum + item.game.price, 0)} €
      </div>
    </div>
  );
}
