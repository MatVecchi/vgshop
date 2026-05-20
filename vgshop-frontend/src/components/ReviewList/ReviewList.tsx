"use client";

import useSWRInfinite from "swr/infinite";
import { Spinner } from "../ui/spinner";
import { useState, useMemo, SubmitEvent, useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "../ui/button";
import { Star } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";
import api from "@/lib/api";
import useSWR from "swr";
import { ReviewData, Review } from "../ReviewSection/ReviewSection";
import ReivewItem from "../ReviewItem/ReviewItem";

interface Prop {
  url: string;
  mine: boolean;
  onMutateReady?: (mutateValue: any) => void;
}

export default function ReviewList({ url, mine, onMutateReady }: Prop) {
  const [searchRating, setSearchRating] = useState<number | undefined>(
    undefined,
  );

  const {
    data,
    error: reviewError,
    size,
    setSize,
    isLoading: isLoadingReview,
    mutate,
  } = useSWRInfinite(
    (pageIndex: any, previousPageData: any) => {
      if (pageIndex === 0)
        return `${url}?page=1${searchRating ? `&stars=${searchRating}` : ""}`;
      if (previousPageData && !previousPageData.next) {
        return null;
      }
      return `${url}?page=${pageIndex + 1}${searchRating ? `&stars=${searchRating}` : ""}`;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (onMutateReady) {
      onMutateReady(() => mutate);
    }
  }, [mutate, onMutateReady]);

  const reviews = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page: ReviewData) => page.results || []);
  }, [data]);

  const stats = useMemo(() => {
    if (!data || !data[0]) return null;
    return data[0].stats;
  }, [data]);

  if (reviewError) return <>Errore nel caricamento dei commenti</>;
  if (isLoadingReview && !data) {
    return (
      <div className="flex justify-center items-center h-60">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {!mine ? (
        <>
          {[5, 4, 3, 2, 1].map((numStelle) => {
            const percentage = stats ? stats[numStelle] || 0 : 0;

            return (
              <div key={numStelle} className="flex items-center gap-4 mb-2">
                <div
                  className="flex w-24 hover:scale-110 duration-150"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchRating(numStelle);
                  }}
                >
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < numStelle
                          ? "fill-violet-500 text-violet-500"
                          : "text-slate-300 dark:text-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex-1 h-3 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500! transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-12 text-sm font-medium text-slate-600 dark:text-zinc-400">
                  {percentage}%
                </span>
              </div>
            );
          })}
          {searchRating ? (
            <Button
              className="mt-2"
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                setSearchRating(undefined);
              }}
            >
              {" "}
              Annulla filtro{" "}
            </Button>
          ) : null}
          <Separator className="my-2" />
        </>
      ) : null}
      {reviews.length == 0 ? (
        <div>
          <div className="flex-1 h-150 min-h-[600px]">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nessun commento !</EmptyTitle>
                <EmptyDescription>
                  Non ci sono ancora dei commenti riguardo a questo titolo. Sii
                  tu il primo !
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </div>
      ) : (
        <div className="h-150 min-h-[600px]">
          <VirtuosoGrid
            data={reviews}
            endReached={() => {
              if (!isLoadingReview) setSize(size + 1);
            }}
            listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 "
            itemContent={(index, item: Review) => (
              <ReivewItem
                mine={mine}
                index={index}
                item={item}
                mutate={mutate}
              />
            )}
            components={{
              Footer: () => (
                <div className=" flex justify-center w-full col-span-full">
                  {isLoadingReview ? (
                    <Spinner className="w-6 h-6 text-primary" />
                  ) : null}
                </div>
              ),
            }}
          />
        </div>
      )}
    </>
  );
}
