"use client";

import { DashboardPieChart } from "@/components/DashboardPieChart/DashboardPieChart";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ChartPieIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardBarChart } from "@/components/DashboardBarChart/DashboardBarChart";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

type Prop = {
  gameTitles: string[];
  gameTitlesError: any;
  gameTitlesAreLoading: any;
};

interface GameDashboardApi {
  title: string;
  count: number;
  price: number;
}

export default function DashboardPieChartContainer({
  gameTitles,
  gameTitlesError,
  gameTitlesAreLoading,
}: Prop) {
  const [pieSelect, setPieSelect] = useState("all");
  const num = pieSelect === "all" ? null : parseInt(pieSelect, 10);

  const {
    data: gamePieData,
    error: gamePieError,
    isLoading: gamePieIsLoading,
  } = useSWR(`/games/publisher_dashboard/cake/${num ? `?num=${num}` : ""}`, {
    keepPreviousData: true,
  });

  const gameDataCount = useMemo(() => {
    if (!gamePieData) return [];
    return gamePieData.map((item: GameDashboardApi) => ({
      title: item.title,
      value: item.count,
    }));
  }, [gamePieData]);

  const gameDataRevenue = useMemo(() => {
    if (!gamePieData) return [];
    return gamePieData.map((item: GameDashboardApi) => ({
      title: item.title,
      value: item.count * item.price,
    }));
  }, [gamePieData]);

  return (
    <div className="mb-11">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 ">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <ChartPieIcon /> Panoramica vendite{" "}
        </h2>
        <Select value={pieSelect} onValueChange={setPieSelect}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-lg">
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
          title={"Totale copie vendute"}
          description={"Numero totale di copie vendute di ciascun gioco"}
          money={false}
        />
        <DashboardPieChart
          id="game-count-chart"
          data={gameDataRevenue}
          error={gamePieError}
          isLoading={gamePieIsLoading}
          title={"Totale ricavo ottenuto"}
          description={"Totale in € ricavato da ciascun gioco"}
          money={true}
        />
      </div>
    </div>
  );
}
