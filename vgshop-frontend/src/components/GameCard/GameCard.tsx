import { Card } from "@/components/ui/card";
import { Game } from "../GameAddModal/GameAddModal";
import Image from "next/image";

interface Prop {
  params: {
    game: Game;
  };
}

export function GameCard({ params }: Prop) {
  const game = params.game;

  return (
    <div className="w-[90%] group cursor-pointer">
      {/* Container Immagine */}
      <Card
        className="relative overflow-hidden border-zinc-800 bg-zinc-900 duration-300 group-hover:scale-105"
        style={{ aspectRatio: "2/3" }}
      >
        <Image
          src={game.cover}
          alt={`Cover di ${game.title}`}
          fill
          priority
          className="object-cover"
        />
      </Card>

      <div className="mt-3 mx-auto w-[90%] flex items-start justify-between gap-3 px-1">
        <span className="text-white py-0.5 text-lg font-semibold leading-tight line-clamp-2 flex-1 min-w-0">
          {game.title}
        </span>
        <span className="text-white rounded-md text-md font-bold whitespace-nowrap">
          {game.price === 0 ? "Gratis" : `${game.price.toFixed(2)} €`}
        </span>
      </div>
    </div>
  );
}
