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
}: Prop) {
  if (error) return <>Errore nella visualizzazione del grafico</>;
  if (isLoading) return <Spinner />;
  if (!data || data.length === 0) return <>Nessun dato disponibile</>;

  const { chartConfig } = useMemo(() => {
    const config: ChartConfig = {};

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
      const colorIndex = (index % 5) + 1;

      config[chartKey] = {
        label: item,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return { chartConfig: config };
  }, [data]);

  return (
    <Card
      data-chart={id}
      className="flex flex-col w-full border-zinc-500! shadow-none!"
    >
      <CardHeader>
        <div className="flex justify-between w-full">
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                key={index}
                stackId="a"
                fill={chartConfig[item].color}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
