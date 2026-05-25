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
import { Star, MessageSquare, Send, User, MessageCircle } from "lucide-react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import api from "@/lib/api";
import useSWR from "swr";
import Link from "next/link";
import { useSWRConfig } from "swr";
import ReviewList from "@/components/ReviewList/ReviewList";

interface Prop {
  params: {
    gameTitle: string;
  };
}

export interface Review {
  id: number;
  user: { username: string; profile_image: any };
  comment: string;
  stars: number;
  game: number;
  date: Date;
}

export interface ReviewData {
  results: Review;
  previous: string;
  next: string;
  count: number;
  stats: any;
}

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function ReviewSection({ params }: Prop) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );

  const isLoggedIn =
    typeof window !== "undefined" && getCookie("is_logged_in") === "true";

  //da usare se non loggato
  const { data, error: profileError } = useSWR(
    isLoggedIn ? "api/profile" : null,
  );
  const [mutateReviews, setMutateReviews] = useState<any>(null);
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

      mutateReviews();
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      {profileError || !data ? (
        <div className="flex-1">
          <Empty className="p-3!">
            <EmptyHeader>
              <EmptyTitle>
                Esegui il login per commentare!{" "}
                <Button>
                  <Link href={"/login"}> Login </Link>
                </Button>
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        </div>
      ) : data.piva ? null : (
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

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <MessageCircle /> Commenti della community{" "}
        </h2>

        <ReviewList
          url={`/reviews/${params.gameTitle}/`}
          mine={false}
          onMutateReady={(mutateValue) => setMutateReviews(mutateValue)}
        />
      </div>
    </div>
  );
}
