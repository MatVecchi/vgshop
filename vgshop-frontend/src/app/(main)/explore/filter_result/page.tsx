"use client";

import GameList from "@/components/GameList/GameList";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function FilterResult() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return (
    <div className="mt-6">
      <h2 className="uppercase text-2xl font-bold mb-4">
        Risultati della ricerca:
      </h2>

      <GameList params={{ query: queryString.toString() }} />
    </div>
  );
}
