"use client";

import { Virtuoso } from "react-virtuoso";
import useSWRInfinite from "swr/infinite";
import { useMemo } from "react";
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

const getKey = (pageIndex: any, previousPageData: any) => {
  if (pageIndex === 0) return `/shopping_cart/?page=1`;

  if (previousPageData && !previousPageData.next) {
    return null;
  }

  return `/shopping_cart/?page=${pageIndex + 1}`;
};

export default function CartInfiniteScroller() {
  const { data, size, setSize, isLoading } = useSWRInfinite(getKey);

  // Il tuo array flat rimane lo stesso
  const items = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.results || []);
  }, [data]);

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
              <DialogClose asChild>
                <Link href="/explore/">
                  <Button>Esplora il catalogo</Button>
                </Link>
              </DialogClose>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "500px" }}>
      <Virtuoso
        data={items}
        // Quando l'utente arriva in fondo, carica la pagina successiva
        endReached={() => {
          if (!isLoading) setSize(size + 1);
        }}
        // Come renderizzare ogni riga
        itemContent={(index, item) => (
          <div key={item.id} style={{ padding: "10px" }}>
            {item.name}
          </div>
        )}
        // (Opzionale) Indicatore di caricamento in fondo
        components={{
          Footer: () => (isLoading ? <p>Caricamento...</p> : null),
        }}
      />
    </div>
  );
}
