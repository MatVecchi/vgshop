"use client";

import GameList from "@/components/GameList/GameList";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { FilterIcon } from "lucide-react";

export default function FilterResult() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
        <FilterIcon className="h-5 w-5 text-primary" />
        Risultati della ricerca:
      </h2>

      <GameList params={{ query: queryString.toString() }} />
    </div>
  );
}
