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
import { DashboardAreaChart } from "@/components/DashboardAreaChart/DashboardAreaChart";
import DashboardAreaChartContainer from "@/components/DashboardAreaChartContainer/DashboardAreaChartContainer";
import DashboardBarChartContainer from "@/components/DashboardBarChartContainer/DashboardBarChartContainer";
import DashboardPieChartContainer from "@/components/DashboardPieChartContainer/DashboardPieChartContainer";
import ReviewList from "@/components/ReviewList/ReviewList";
import { Empty } from "../ui/empty";
import { MessageCircle } from "lucide-react";

type Prop = {
  gameTitles: string[];
};

export default function DashboardReviewSection({ gameTitles }: Prop) {
  const [gameSearch, setSearchGame] = useState<string>("all");

  return (
    <div className="my-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 ">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <MessageCircle /> Commenti dei tuoi giochi{" "}
        </h2>

        <Select value={gameSearch} onValueChange={setSearchGame}>
          <SelectTrigger className="w-full sm:w-50 rounded-lg">
            <SelectValue placeholder="Quale giocho vuoi vedere?" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem key={0} value="all">
                {" "}
                ---{" "}
              </SelectItem>
              {gameTitles?.map((item: string, index: number) => (
                <SelectItem key={index + 1} value={item}>
                  {" "}
                  {item}{" "}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {gameSearch === "all" ? (
        <Empty>Seleziona un gioco per mostrare i commenti !</Empty>
      ) : (
        <ReviewList url={`/reviews/${gameSearch}/`} mine={false} />
      )}
    </div>
  );
}
