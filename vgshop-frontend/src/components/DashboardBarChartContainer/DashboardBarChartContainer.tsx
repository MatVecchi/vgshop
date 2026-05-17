"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { ChartColumnStackedIcon } from "lucide-react";
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

export default function DashboardBarChartContainer({
  gameTitles,
  gameTitlesError,
  gameTitlesAreLoading,
}: Prop) {
  const [gameSearch, setSearchGame] = useState<string>("all");
  const [barYear, setBarYear] = useState<number>(2026);

  const {
    data: gameBarData,
    error: gameBarError,
    isLoading: gameBarisLoading,
    isValidating,
  } = useSWR(
    `/games/publisher_dashboard/${gameSearch && gameSearch != "all" ? `${gameSearch}/game_bar_detail` : "bar/"}${barYear === 2026 ? "" : `?year=${barYear}`}`,
    { keepPreviousData: true },
  );

  return (
    <div className="my-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 ">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <ChartColumnStackedIcon /> Quanti giochi hai venduto per ogni mese
          ?{" "}
        </h2>
        {gameTitlesError ? null : gameTitlesAreLoading ? (
          <Spinner />
        ) : (
          <div className="flex gap-2">
            <Select value={gameSearch} onValueChange={setSearchGame}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-lg">
                <SelectValue placeholder="Quale giocho vuoi vedere?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem key={0} value="all">
                    {" "}
                    Tutti{" "}
                  </SelectItem>
                  {gameTitles.map((item: string, index: number) => (
                    <SelectItem key={index + 1} value={item}>
                      {" "}
                      {item}{" "}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              className="w-full sm:w-[200px] rounded-lg"
              placeholder="Anno"
              type="number"
              value={barYear}
              onChange={(e) => setBarYear(e.target.valueAsNumber || 2026)}
            />
          </div>
        )}
      </div>
      <div className=" my-2 flex gap-5 w-full">
        <DashboardBarChart
          data={gameBarData}
          error={gameBarError}
          isLoading={gameBarisLoading}
          id="game-bar"
          title="Vendite mensili"
          description={`Numero di copie mensili ${gameSearch === "all" ? "" : `di ${gameSearch}`} vendute nel ${barYear}`}
          isValidating={isValidating}
        />
      </div>
    </div>
  );
}
