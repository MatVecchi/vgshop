import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Game } from "../GameAddModal/GameAddModal";

export function GameCard(game: Game) {
  return (
    <Card
      className="relative mx-auto w-full max-w-xs"
      style={{ paddingTop: 0 }}
    >
      <div className="absolute inset-0 z-30 aspect-square bg-black/35" />
      <img
        src={game.cover}
        alt="game cover"
        className="relative z-20 w-full object-contain brightness-60 grayscale dark:brightness-40"
        style={{ maxHeight: "20rem" }}
      />
      <CardHeader>
        <CardAction>
          {" "}
          <Button className="w-full" disabled={true}>
            {game.price}
          </Button>
        </CardAction>
        <CardTitle>{game.title}</CardTitle>
      </CardHeader>
    </Card>
  );
}
