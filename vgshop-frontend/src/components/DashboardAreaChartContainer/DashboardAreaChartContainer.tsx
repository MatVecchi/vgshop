"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartSplineIcon, TrendingUp } from "lucide-react";
import { DashboardAreaChart } from "@/components/DashboardAreaChart/DashboardAreaChart";
import { useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import useSWR from "swr";

type Prop = {
  gameTitles: string[];
  gameTitlesError: any;
  gameTitlesAreLoading: any;
};

export default function DashboardAreaChartContainer({
  gameTitles,
  gameTitlesError,
  gameTitlesAreLoading,
}: Prop) {
  const [timeRange, setTimeRange] = useState("30");
  const [gameSearch, setSearchGame] = useState<string>("all");
  const [isCumulative, setIsCumulative] = useState<boolean>(false);

  const getUrlArgs = () => {
    const params = new URLSearchParams();

    if (timeRange) params.append("time_range", timeRange);
    if (isCumulative) params.append("cumulative", "true");

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const {
    data: gameData,
    error: gameError,
    isLoading: gameIsLoading,
    isValidating,
  } = useSWR(
    `/games/publisher_dashboard/${gameSearch && gameSearch != "all" ? `${gameSearch}/detail/` : "area/"}${getUrlArgs()}`,
    { keepPreviousData: true },
  );

  const chartTitle = isCumulative ? "Ricavi Cumulativi" : "Ricavi Mensili";

  const timeRangeLabel =
    {
      "7": "ultimi 7 giorni",
      "30": "ultimi 30 giorni",
      "90": "ultimi 3 mesi",
      "365": "ultimo anno",
    }[timeRange] || "periodo selezionato";

  const chartDescription = `Ricavi ${
    isCumulative ? "cumulativi" : "mensili"
  }${gameSearch !== "all" ? ` relativi a ${gameSearch}` : ""} riferiti a: ${timeRangeLabel}.`;

  return (
    <div className="my-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 ">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <ChartSplineIcon className="h-5 w-5 text-primary" />
          Quanto hai ricavato dai tuoi giochi?
        </h2>
        {gameTitlesError ? null : gameTitlesAreLoading ? (
          <Spinner />
        ) : (
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="365" className="rounded-lg">
                  Ultimo anno
                </SelectItem>
                <SelectItem value="90" className="rounded-lg">
                  Ultimi 3 mesi
                </SelectItem>
                <SelectItem value="30" className="rounded-lg">
                  Ultimi 30 giorni
                </SelectItem>
                <SelectItem value="7" className="rounded-lg">
                  Ultimi 7 giorni
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={gameSearch} onValueChange={setSearchGame}>
              <SelectTrigger className="w-full sm:w-50 rounded-lg">
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

            <div className="flex items-center space-x-2">
              <Switch
                id="isCumulative"
                checked={isCumulative}
                onCheckedChange={setIsCumulative}
              />
              <Label htmlFor="isCumulative">Cumulativo</Label>
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        <DashboardAreaChart
          data={gameData}
          error={gameError}
          isLoading={gameIsLoading}
          isValidating={isValidating}
          id="dashboard-area-revenue"
          title={chartTitle}
          description={chartDescription}
        />
      </div>
    </div>
  );
}
