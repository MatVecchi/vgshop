"use client";

import GameInfo from "@/components/GameInfo/GameInfo";
import { use } from "react";
import useSWR from "swr";

interface Props {
  params: Promise<{ title: string }>;
}

export default function GameInfoPage({ params }: Props) {
  const title = use(params).title;

  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
  } = useSWR(`/games/catalogue/${title}`);

  return (
    <>
      <div className="max-w-full flex-1 mx-0 p-0">
        <GameInfo
          params={{
            game: gameData,
            error: gameError,
            isLoading: gameIsLoading,
          }}
        />
      </div>
    </>
  );
}
