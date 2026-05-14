"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Star,
  MessageSquare,
  Send,
  User,
  Gamepad2,
  CrossIcon,
  DeleteIcon,
  X,
  Pen,
} from "lucide-react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { ReviewData, Review } from "../ReviewSection/ReviewSection";
import api from "@/lib/api";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { Spinner } from "../ui/spinner";
import { useState, useMemo, SubmitEvent } from "react";
import { toast } from "sonner";

interface Prop {
  index: number;
  item: Review;
  mine: boolean;
  mutate: any;
}

export default function ReivewItem({ index, item, mine, mutate }: Prop) {
  const [comment, setComment] = useState<string>(item.comment);
  const [rating, setRating] = useState<number>(item.stars);
  const [hover, setHover] = useState<number>(0);

  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleReset = () => {
    setIsEditing(false);
    setComment(item.comment);
    setRating(item.stars);
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("stars", rating.toString());
      formData.append("comment", comment);

      const response = await api.patch(`/reviews/${item.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Commento modificato con successo !");
      setIsEditing(false);
      mutate();
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella modifica del commento! riprova");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (e: any) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      const response = await api.delete(`/reviews/${item.id}/`);
      toast.success("Commento eliminato con successo !");
      mutate();
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella rimozione del commento! riprova");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
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
            <div>
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="mx-1"
                    onClick={handleReset}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="secondary"
                    className="mx-1"
                    onClick={(e) => handleUpdate(e)}
                  >
                    Conferma
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="mx-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pen />
                </Button>
              )}
              {deleteLoading ? (
                <Spinner />
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <X />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <X />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Cancella commento </AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei davvero sicuro di voler cancellare il commento del{" "}
                        {new Intl.DateTimeFormat("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.date))}{" "}
                        su {item.game}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Annulla
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={(e) => handleDelete(e)}
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        )}
      </div>

      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg shadow-none! border-zinc-700!">
        <CardHeader className="space-y-2 pb-2">
          {isEditing ? (
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
                    className={` w-5 h-5 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-violet-600 text-violet-600"
                        : "text-slate-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
              {errorMessage.stars && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errorMessage.stars[0]}
                </p>
              )}
            </div>
          ) : (
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
          )}

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
          {isEditing ? (
            <>
              <Textarea
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commento ..."
              />
              {errorMessage.comment && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errorMessage.comment[0]}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed line-clamp-4 wrap-break-word">
              {item.comment}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
