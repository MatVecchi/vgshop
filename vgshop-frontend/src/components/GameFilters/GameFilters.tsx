"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchIcon } from "lucide-react";
import { FieldGroup, Field, FieldLabel, FieldSet } from "../ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "../ui/spinner";
import useSWR from "swr";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function GameFilters() {
  const {
    data: tag_list,
    error,
    isLoading: isTagListLoading,
  } = useSWR("/games/catalogue/tag_list/");
  const [price, setPrice] = useState<number[]>([0.0, 10.0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="w-full border-none shadow-none bg-secondary/10">
      <CardHeader>
        <CardTitle className="uppercase text-xl font-bold">
          Filtri di ricerca
        </CardTitle>
        <CardDescription>Affina la tua ricerca nel catalogo</CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <FieldSet className="space-y-8 w-full">
            <FieldGroup>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="publisher">
                    Nome del Publisher
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput id="publisher" placeholder="Search..." />
                    <InputGroupAddon align="inline-start">
                      <SearchIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Label htmlFor="price">Prezzo</Label>
                    <span className="text-sm text-muted-foreground ">
                      {price.join(", ")}
                    </span>
                  </div>

                  <Slider
                    id="price"
                    value={price}
                    onValueChange={setPrice}
                    min={0}
                    max={100}
                    step={1}
                  />
                </Field>
                <Field>
                  <Label htmlFor="release_date">Data di rilascio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!date}
                        className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span>Seleziona una data</span>
                        )}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="tag_list">Tags </Label>
              <ToggleGroup
                type="multiple"
                size="default"
                variant="outline"
                spacing={1}
                className="gap-1"
                style={{ flexWrap: "wrap" }}
                id="tag_list"
                value={selectedTags}
                onValueChange={(e) => setSelectedTags(e)}
              >
                {isTagListLoading ? (
                  <Spinner />
                ) : (
                  tag_list.map((tag: any, i: string) => {
                    return (
                      <ToggleGroupItem
                        key={tag.name}
                        id={tag.name}
                        name={tag.name}
                        value={tag.name}
                      >
                        {tag.name}
                      </ToggleGroupItem>
                    );
                  })
                )}
              </ToggleGroup>
            </FieldGroup>

            <FieldGroup>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
}
