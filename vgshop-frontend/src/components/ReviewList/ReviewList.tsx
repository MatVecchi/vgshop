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
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { Star, MessageSquare, Send, User, Gamepad2 } from "lucide-react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import api from "@/lib/api";
import useSWR from "swr";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { ReviewData, Review } from "../ReviewSection/ReviewSection";

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

  console.log(reviews);

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
            <div className="flex flex-col gap-3 h-full">
              <div className="flex items-center gap-3 px-1">
                {!mine ? (
                  <>
                    <div className="h-9 w-9 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                      <User className="w-4 h-4 text-violet-500" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                      @{item.user}
                    </span>
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-5 h-5 text-violet-500" />
                    <span className="font-bold text-lg text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                      {item.game}
                    </span>
                  </>
                )}
              </div>

              <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg shadow-none! border-zinc-700!">
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < item.stars
                              ? "fill-violet-500 text-violet-500"
                              : "text-slate-300 dark:text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    {new Intl.DateTimeFormat("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.date))}
                  </div>
                </CardHeader>

                <CardContent className="grow">
                  <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed line-clamp-4 wrap-break-word">
                    {item.comment}
                  </p>
                </CardContent>
              </Card>
            </div>
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
