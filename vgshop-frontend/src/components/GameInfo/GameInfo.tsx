import { Button } from "@/components/ui/button";
import { Game } from "../GameAddModal/GameAddModal";
import { Spinner } from "../ui/spinner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tag,
  Star,
  ShoppingCart,
  User,
  Notebook,
  Gamepad2,
  CalendarDays,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { getYouTubeEmbedUrl } from "../BigGameCarousel/BigGameCarousel";
import Image from "next/image";
import { useState } from "react";
import { Input } from "../ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import useSWR from "swr";

interface Props {
  params: {
    game: Game;
    error: any;
    isLoading: boolean;
  };
}

export default function GameInfo({ params }: Props) {
  const { game, error, isLoading } = params;
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    data: library,
    error: libraryError,
    isLoading: libraryLoading,
  } = useSWR(`library/${game?.title}/`);

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        Errore nel caricamento
      </div>
    );

  const handleSubmit = async (title: string) => {
    setSubmitLoading(true);
    setErrorMessage(""); // Resetta l'errore precedente

    try {
      const formData = new FormData();
      formData.append("game", title);

      await api.post("shopping_cart/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gioco aggiunto con successo !");
    } catch (e: any) {
      const errorData = e.response?.data;

      if (errorData) {
        const firstKey = Object.keys(errorData)[0];
        const message = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];

        setErrorMessage(message);
        toast.error(message);
      } else {
        setErrorMessage("Errore imprevisto dal server");
        toast.error("Errore imprevisto");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-0 text-foreground font-sans">
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "480px" }}
      >
        <img
          src={
            game.images[0]?.image ||
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=80"
          }
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=80";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6">
          <div className="flex flex-row justify-between items-end mx-0">
            <div className="flex items-end gap-6">
              <img
                src={game.cover}
                alt={game.title}
                className="w-32 h-44 object-cover rounded-xl shadow-2xl border border-border flex-shrink-0 hidden sm:block"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {game.tag_list.map((tag) => (
                    <span
                      key={tag.name}
                      className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-1 drop-shadow-lg">
                  {game.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-xl">
                      5.0
                    </span>
                    <span className="text-foreground/80">
                      <Star />
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div>{game.release_date}</div>
                </div>
              </div>
            </div>

            <div>
              {libraryError?.status == 404 && !libraryLoading ? (
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold gap-3 group transition-all hover:scale-105 shadow-lg shadow-primary/20"
                  type="submit"
                  onClick={() => {
                    if (libraryError?.status == 401) {
                      window.location.href = "/login";
                    } else {
                      handleSubmit(game.title);
                    }
                  }}
                >
                  <span className="tracking-tight">
                    {game.price == 0 ? "GRATIS" : `${game.price}€`}
                  </span>

                  <div className="w-px h-6 bg-primary-foreground/20" />

                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                    Aggiungi al carrello
                  </div>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 ">
        <div className="flex flex-row gap-10">
          <Carousel className="w-full max-w-[60%] mx-auto">
            <CarouselContent>
              <CarouselItem>
                <div className="p-3">
                  <Card className="overflow-hidden border-none p-0">
                    <CardContent className="relative aspect-video p-0">
                      <iframe
                        src={getYouTubeEmbedUrl(game.video, origin)}
                        title={`Trailer di ${game.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full absolute inset-0"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>

              {game.images?.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card className="overflow-hidden border-none p-0">
                      <CardContent className="relative aspect-video p-0 flex items-center justify-center">
                        <Image
                          src={image?.image || game.cover}
                          alt={`Galleria ${index}`}
                          fill
                          priority
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <Card className="w-full max-w-[30%] ">
            <CardHeader>
              <div className="flex gap-5 items-center">
                <Gamepad2 />
                <h1 className="text-xl md:text-5xl font-black text-foreground mb-1 drop-shadow-lg">
                  {game.title}
                </h1>
              </div>
              <Separator />
              <CardContent>
                <div className="my-4">
                  <div className="flex gap-5 items-center mb-3">
                    <Tag />
                    <h1 className="text-xl md:text-xl font-black text-foreground  drop-shadow-lg">
                      Tags
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.tag_list.map((tag) => (
                      <span
                        key={tag.name}
                        className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="my-5">
                  <div className="flex gap-5">
                    <Notebook />
                    <h1 className="text-xl md:text-xl font-black text-foreground mb-1 drop-shadow-lg">
                      Descrizione
                    </h1>
                  </div>
                  <p> {game.description} </p>
                </div>

                <div className="my-5">
                  <div className="flex gap-5">
                    <CalendarDays />
                    <h1 className="text-xl md:text-xl font-black text-foreground mb-1 drop-shadow-lg">
                      Data di rilascio
                    </h1>
                  </div>
                  <p> {game.release_date} </p>
                </div>

                <div className="my-5">
                  <div className="flex gap-5">
                    <User />
                    <h1 className="text-xl md:text-xl font-black text-foreground mb-1 drop-shadow-lg">
                      Publisher
                    </h1>
                  </div>
                  <p> {game.publisher} </p>
                </div>

                <div className="my-5">
                  <div className="flex gap-5">
                    <h1 className="text-xl md:text-xl font-black text-foreground mb-1 drop-shadow-lg">
                      5.0
                    </h1>
                    <Star />
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-10">
          <h1 className="text-xl md:text-xl font-black text-foreground mb-1 drop-shadow-lg">
            Recensioni & Commenti
          </h1>
        </div>
      </div>
    </div>
  );
}
