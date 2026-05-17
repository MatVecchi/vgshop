"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "../ui/spinner";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "An interactive area chart";

interface chartData {
  date: string;
  [gameTitle: string]: string | number;
}

type Prop = {
  data: chartData[] | undefined;
  error: any;
  isLoading: any;
  id: string;
  title: string;
  description: string;
  isValidating: boolean;
};

export function DashboardAreaChart({
  data,
  error,
  isLoading,
  id,
  title,
  description,
  isValidating,
}: Prop) {
  const { chartConfig } = useMemo(() => {
    const config: ChartConfig = {
      visitors: {
        label: "Visitors",
      },
    };

    if (!data) return { chartConfig: config };

    const gameTitles = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((title) => {
        if (title !== "date") {
          gameTitles.add(title);
        }
      });
    });

    Array.from(gameTitles).forEach((item, index) => {
      const chartKey = item;
      const hueStep = (index * 17) % 20;
      const tierStep = index % 2 === 0 ? 2 : 3;
      const colorIndex = tierStep * 20 + hueStep + 1;

      config[chartKey] = {
        label: item,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return { chartConfig: config };
  }, [data]);

  if (error) return <>Errore nella visualizzazione del grafico</>;
  if (!data || data.length === 0) return <>Nessun dato disponibile</>;

  const gameKeys = Object.keys(chartConfig).filter((key) => key !== "visitors");
  const safeTitleId = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

  return (
    <Card
      className={`pt-0 w-full border-zinc-500! shadow-none! transition-opacity ${isValidating ? "opacity-60" : "opacity-100"}`}
    >
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[300px] w-full opacity-50">
            <Spinner className="h-12 w-12 mx-auto" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                {gameKeys.map((item) => (
                  <linearGradient
                    id={`fill_${id}_${safeTitleId(item)}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                    key={`gradient_${item}`}
                  >
                    <stop
                      offset="5%"
                      stopColor={chartConfig[item].color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartConfig[item].color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
                  return `€${value}`;
                }}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />

              {gameKeys.map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`url(#fill_${id}_${safeTitleId(key)})`}
                  stroke={chartConfig[key].color}
                  fillOpacity={0.6}
                />
              ))}

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
