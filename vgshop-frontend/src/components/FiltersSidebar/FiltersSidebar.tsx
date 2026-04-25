"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import useSWR from "swr";

export function FiltersSidebar() {
  const {
    data: tags,
    error: errorTags,
    mutate,
  } = useSWR("/games/catalogue/tag_list");
  const { data: games, error: errorGames } = useSWR("/games/catalogue/");

  const [price, setPrice] = useState<number[]>([0.0, 10.0]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="uppercase text-2xl text-center font-bold">
          Filtri di ricerca
        </CardTitle>
        <CardDescription>
          Modifica i filtri per una ricerca mirata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="price">Prezzo</Label>
                <span className="text-sm text-muted-foreground">
                  {price.join(", ")}
                </span>
              </div>

              <Slider
                id="price"
                value={price}
                onValueChange={setPrice}
                min={0}
                max={20}
                step={1}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Tags</Label>
              <ToggleGroup
                type="multiple"
                size="default"
                variant="outline"
                spacing={1}
                className="gap-1"
                style={{ flexWrap: "wrap" }}
              >
                <ToggleGroupItem value="top" aria-label="Toggle top">
                  Top
                </ToggleGroupItem>
                <ToggleGroupItem value="bottom" aria-label="Toggle bottom">
                  Bottom
                </ToggleGroupItem>
                <ToggleGroupItem value="left" aria-label="Toggle left">
                  Left
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Toggle right">
                  Right
                </ToggleGroupItem>
                <ToggleGroupItem value="a" aria-label="Toggle right">
                  aaaaaaa
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
