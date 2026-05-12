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
import { Star, MessageSquare, Send, User } from "lucide-react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import api from "@/lib/api";
import useSWR from "swr";
import Link from "next/link";
import { useSWRConfig } from "swr";

interface Prop {
  params: {
    gameTitle: string;
  };
}

interface Review {
  user: string;
  comment: string;
  stars: number;
  game: number;
  date: Date;
}

interface ReviewData {
  results: Review;
  previous: string;
  next: string;
  count: number;
}

export default function ReviewSection({ params }: Prop) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const {
    data,
    error: reviewError,
    size,
    setSize,
    isLoading: isLoadingReview,
    mutate,
  } = useSWRInfinite((pageIndex: any, previousPageData: any) => {
    if (pageIndex === 0) return `/reviews/${params.gameTitle}/?page=1`;
    if (previousPageData && !previousPageData.next) {
      return null;
    }
    return `/reviews/${params.gameTitle}/?page=${pageIndex + 1}`;
  });

  const { error: profileError } = useSWR("api/profile");
  const { mutate: mutateGame } = useSWRConfig();

  const handleReset = () => {
    setRating(0);
    setHover(0);
    setComment("");
    setErrorMessage({});
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("game", params.gameTitle);
      formData.append("comment", comment);
      formData.append("stars", rating.toString());

      const response = await api.post("/reviews/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Commento agggiunto con successo !");
      mutate();
      mutateGame(`/games/catalogue/${params.gameTitle}`);
      handleReset();
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nell'aggiunta della recensione! riprova");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const reviews = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page: ReviewData) => page.results || []);
  }, [data]);

  if (reviewError) return <>Errore nel caricamento dei commenti</>;
  if (isLoadingReview) return <Spinner />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      {profileError ? (
        <div className="flex-1">
          <Empty className="p-3!">
            <EmptyHeader>
              <EmptyTitle>
                Esegui il login per commentare !{" "}
                <Button>
                  <Link href={"/login"}> Login </Link>
                </Button>
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <Card className=" p-6 rounded-2xl">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Lascia una recensione</h2>
          </div>

          <form
            className="grid grid-cols-1 gap-6 items-end"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center p-2 rounded-md">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button" // Importante: evita il submit del form al click
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    size={30}
                    className={`transition-colors ${
                      star <= (hover || rating)
                        ? "fill-violet-600 text-violet-600"
                        : "text-slate-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="md:col-span-2 space-y-2">
              {errorMessage.stars && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errorMessage.stars[0]}
                </p>
              )}
              <Label htmlFor="comment" className="text-sm font-medium">
                Il tuo pensiero
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cosa ne pensi del gioco?"
              />
              {errorMessage.comment && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errorMessage.comment[0]}
                </p>
              )}
            </div>

            <div>
              <Button
                className="mx-2 gap-2 transition-all hover:scale-[1.02]"
                variant="secondary"
                type="button"
                onClick={handleReset}
              >
                Annulla
              </Button>
              <Button className=" mx-2 gap-2 transition-all hover:scale-[1.02]">
                Invia <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6 h-150">
        <h1 className="text-2xl font-medium  uppercase tracking-wider">
          Commenti della community
        </h1>
        <Separator className="mt-5" />
        {reviews.length == 0 ? (
          <div>
            <div className="flex-1">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Nessun commento !</EmptyTitle>
                  <EmptyDescription>
                    Non ci sono ancora dei commenti riguardo a questo titolo.
                    Sii tu il primo !
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
                  <div className="h-9 w-9 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <User className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                    @{item.user}
                  </span>
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
      </div>
    </div>
  );
}
