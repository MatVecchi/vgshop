"use client";

import { useState } from "react";
import { Game } from "../GameAddModal/GameAddModal";
import { GameCard } from "../GameCard/GameCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";

interface Props {
  params: {
    query: string | undefined;
  };
}

export default function GameList({ params }: Props) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, error, isLoading } = useSWR(
    `/games/catalogue/?page=${currentPage}${params.query ? `&${params.query}` : ""}`,

    { keepPreviousData: true },
  );

  const totalPages = data ? Math.ceil(data.count / 12) : 0;

  if (error)
    return (
      <div className="text-red-500 p-4 text-center">
        Errore: {error.message}
      </div>
    );

  if (!isLoading && data && data.count === 0) {
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

  const currentGames: Game[] = data?.results || [];
  console.log(currentGames);

  return (
    <div className="space-y-8" style={{ width: "90%", margin: "auto" }}>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {currentGames.slice(0, 12).map((game) => (
            <GameCard key={game.id} params={{ game }} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: any) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive className="cursor-default">
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: any) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
