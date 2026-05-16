"use client";

import { DashboardPieChart } from "@/components/DashboardPieChart/DashboardPieChart";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameDashboardApi {
  title: string;
  count: number;
  price: number;
}

export default function PublisherDashboard() {
  const [pieSelect, setPieSelect] = useState("all");
  const num = pieSelect === "all" ? null : parseInt(pieSelect, 10);

  const {
    data: gamePieData,
    error: gamePieError,
    isLoading: gamePieIsLoading,
  } = useSWR(`/games/publisher_dashboard/cake/${num ? `?num=${num}` : ""}`);

  if (!gamePieData) return;

  const gameDataCount = useMemo(() => {
    return gamePieData.map((item: GameDashboardApi) => ({
      title: item.title,
      value: item.count,
    }));
  }, [gamePieData]);

  const gameDataRevenue = useMemo(() => {
    return gamePieData.map((item: GameDashboardApi) => ({
      title: item.title,
      value: item.count * item.price,
    }));
  }, [gamePieData]);

  return (
    <>
      <div>
        <div className="flex gap-5 items-center">
          <h2 className="uppercase text-2xl font-bold my-5">
            Panoramica vendite{" "}
          </h2>
          <Select value={pieSelect} onValueChange={setPieSelect}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Quanti giochi vuoi vedere?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Numero giochi</SelectLabel>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="25">Top 25</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className=" my-2 flex gap-5 w-full">
          <DashboardPieChart
            id="game-count-chart"
            data={gameDataCount}
            error={gamePieError}
            isLoading={gamePieIsLoading}
            title={"Copie vendute"}
            description={
              "Grafico a torta del numero di copie vendute per gioco"
            }
            money={false}
          />
          <DashboardPieChart
            id="game-count-chart"
            data={gameDataRevenue}
            error={gamePieError}
            isLoading={gamePieIsLoading}
            title={"Ricavo ottenuto"}
            description={"Grafico a torta del ricavo in € per ogni gioco"}
            money={true}
          />
        </div>
      </div>
    </>
  );
}
