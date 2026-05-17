"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "../ui/spinner";

interface chartData {
  title: string;
  value: number;
}

type Prop = {
  id: string;
  data: chartData[];
  error: any;
  isLoading: any;
  title: string;
  description: string;
  money: boolean;
};

export function DashboardPieChart({
  id: propId,
  data,
  error,
  isLoading,
  title,
  description,
  money = false,
}: Prop) {
  const id = propId;

  if (error) return <>Errore nella visualizzazione del grafico</>;
  if (isLoading) return <Spinner />;
  if (!data || data.length === 0) return <>Nessun dato disponibile</>;

  const [active, setActive] = React.useState(data[0]?.title || "");

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.title === active),
    [active, data],
  );

  const titles = React.useMemo(() => data.map((item) => item.title), [data]);

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 25}
              innerRadius={outerRadius + 12}
            />
          </g>
        );
      }
      return <Sector {...props} outerRadius={outerRadius} />;
    },
    [activeIndex],
  );

  const { chartConfig, formattedChartData } = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: money ? "Ricavo" : "Vendite",
      },
    };

    const formattedData = data.map((item, index) => {
      const chartKey = item.title.replace(/\s+/g, "-");
      const colorIndex = (index % 5) + 1;

      config[chartKey] = {
        label: item.title,
        color: `var(--chart-${colorIndex})`,
      };

      return {
        title: chartKey,
        value: item.value,
        fill: `var(--color-${chartKey})`,
      };
    });

    return { chartConfig: config, formattedChartData: formattedData };
  }, [data]);

  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <Card
      data-chart={id}
      className="flex flex-col w-full border-zinc-500! shadow-none! "
    >
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={active} onValueChange={setActive}>
          <SelectTrigger
            className="ml-auto h-7 w-37.5 rounded-lg pl-2.5"
            aria-label="Select a game"
          >
            <SelectValue placeholder="Seleziona gioco" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {titles.map((titleString) => {
              const chartKey = titleString.replace(/\s+/g, "-");
              const config = chartConfig[chartKey];

              if (!config) return null;

              return (
                <SelectItem
                  key={titleString}
                  value={titleString}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${chartKey})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-75 h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={formattedChartData}
              dataKey="value"
              nameKey="title"
              innerRadius={60}
              strokeWidth={5}
              shape={renderPieShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formattedChartData[
                            safeActiveIndex
                          ]?.value.toLocaleString() || 0}
                          {money ? "€" : ""}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Vendite
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
