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

export default function PublisherDashboard() {
  const {
    data: gameTitles,
    error: gameTitlesError,
    isLoading: gameTitlesAreLoading,
  } = useSWR(`/games/publisher_dashboard/`);

  return (
    <>
      <div>
        <DashboardPieChartContainer
          gameTitles={gameTitles}
          gameTitlesError={gameTitlesError}
          gameTitlesAreLoading={gameTitlesAreLoading}
        />

        <DashboardBarChartContainer
          gameTitles={gameTitles}
          gameTitlesError={gameTitlesError}
          gameTitlesAreLoading={gameTitlesAreLoading}
        />

        <DashboardAreaChartContainer
          gameTitles={gameTitles}
          gameTitlesError={gameTitlesError}
          gameTitlesAreLoading={gameTitlesAreLoading}
        />
      </div>
    </>
  );
}
