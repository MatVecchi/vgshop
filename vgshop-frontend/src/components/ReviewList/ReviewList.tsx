"use client";

import useSWRInfinite from "swr/infinite";
import { Spinner } from "../ui/spinner";
import { useState, useMemo, SubmitEvent } from "react";
import { toast } from "sonner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { VirtuosoGrid } from "react-virtuoso";
import api from "@/lib/api";
import useSWR from "swr";
import { ReviewData, Review } from "../ReviewSection/ReviewSection";
import ReivewItem from "../ReviewItem/ReviewItem";

interface Prop {
  url: string;
  mine: boolean;
}

export default function ReviewList({ url, mine }: Prop) {
  const {
    data,
    error: reviewError,
    size,
    setSize,
    isLoading: isLoadingReview,
    mutate,
  } = useSWRInfinite((pageIndex: any, previousPageData: any) => {
    if (pageIndex === 0) return `${url}?page=1`;
    if (previousPageData && !previousPageData.next) {
      return null;
    }
    return `${url}?page=${pageIndex + 1}`;
  });

  const { error: profileError } = useSWR("api/profile");

  const reviews = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page: ReviewData) => page.results || []);
  }, [data]);

  if (reviewError) return <>Errore nel caricamento dei commenti</>;
  if (isLoadingReview) return <Spinner />;

  

  return (
    <>
      {reviews.length == 0 ? (
        <div>
          <div className="flex-1">
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
        <VirtuosoGrid
          data={reviews}
          endReached={() => {
            if (!isLoadingReview) setSize(size + 1);
          }}
          listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 "
          itemContent={(index, item: Review) => (
            <ReivewItem mine={mine} index={index} item={item} mutate={mutate} />
          )}
          components={{
            Footer: () => (
              <div className="py-10 flex justify-center w-full col-span-full">
                {isLoadingReview ? (
                  <Spinner className="w-6 h-6 text-primary" />
                ) : null}
              </div>
            ),
          }}
        />
      )}
    </>
  );
}
