"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Spinner } from "../ui/spinner";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Prop = {
  data: chartData[] | undefined;
  error: any;
  isLoading: any;
  id: string;
  title: string;
  description: string;
  isValidating: boolean;
};

interface chartData {
  month: string;
  [gameTitle: string]: string | number;
}

export function DashboardBarChart({
  data,
  error,
  isLoading,
  id,
  title,
  description,
  isValidating,
}: Prop) {
  const { chartConfig } = useMemo(() => {
    const config: ChartConfig = {};

    if (!data) return { chartConfig: config };

    const gameTitles = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((title) => {
        if (title !== "month") {
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

  return (
    <Card
      data-chart={id}
      className={`flex flex-col w-full border-zinc-500! shadow-none! ${isValidating ? "opacity-60" : "opacity-100"}`}
    >
      <CardHeader className="border-b">
        <div className="flex justify-between w-full">
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-75 w-full opacity-50">
            <Spinner className="h-12 w-12 mx-auto" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ left: -20, right: 10 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              {Object.keys(chartConfig).map((item, index) => (
                <Bar
                  dataKey={item}
                  key={item}
                  stackId="a"
                  fill={chartConfig[item].color}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
