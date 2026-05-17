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
import { DashboardBarChart } from "@/components/DashboardBarChart/DashboardBarChart";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

interface GameDashboardApi {
  title: string;
  count: number;
  price: number;
}

export default function PublisherDashboard() {
  const [pieSelect, setPieSelect] = useState("all");
  const [gameSearch, setSearchGame] = useState<string>("all");
  const [barYear, setBarYear] = useState<number>(2026);
  const num = pieSelect === "all" ? null : parseInt(pieSelect, 10);

  const {
    data: gamePieData,
    error: gamePieError,
    isLoading: gamePieIsLoading,
  } = useSWR(`/games/publisher_dashboard/cake/${num ? `?num=${num}` : ""}`);

  const {
    data: gameTitles,
    error: gameTitlesError,
    isLoading: gameTitlesAreLoading,
  } = useSWR(`/games/publisher_dashboard/`);

  const {
    data: gameBarData,
    error: gameBarError,
    isLoading: gameBarisLoading,
  } = useSWR(
    `/games/publisher_dashboard/${gameSearch && gameSearch != "all" ? `${gameSearch}/game_bar_detail` : "bar/"}${barYear === 2026 ? "" : `?year=${barYear}`}`,
  );

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

        <div>
          <div className="flex gap-5 items-center">
            <h2 className="uppercase text-2xl font-bold my-5">
              Quanti giochi hai venduto per ogni mese ?{" "}
            </h2>
            {gameTitlesError ? null : gameTitlesAreLoading ? (
              <Spinner />
            ) : (
              <div className="flex gap-2">
                <Select value={gameSearch} onValueChange={setSearchGame}>
                  <SelectTrigger className="w-full max-w-48">
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
              description="Copie vendute al mese"
            />
          </div>
        </div>
      </div>
    </>
  );
}
