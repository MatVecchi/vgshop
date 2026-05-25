import { Button } from "@/components/ui/button";
import { Game, Tag } from "../GameAddModal/GameAddModal";
import { Spinner } from "../ui/spinner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { format } from "date-fns";
import { Banknote, Check, ChevronDownIcon, PiggyBank } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Star,
  ShoppingCart,
  User,
  Notebook,
  Gamepad2,
  CalendarDays,
  PenIcon,
  PlusCircleIcon,
  XCircleIcon,
  X,
  TagIcon,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { getYouTubeEmbedUrl } from "../BigGameCarousel/BigGameCarousel";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import ReviewSection from "../ReviewSection/ReviewSection";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Field } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { useRouter } from "next/navigation";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface Props {
  params: {
    game: Game;
    error: any;
    isLoading: boolean;
    fromPanel?: boolean;
  };
}

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function GameInfo({ params }: Props) {
  const { game, error, isLoading, fromPanel = false } = params;
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { mutate: mutateCart } = useSWRConfig();

  const isLoggedIn =
    typeof window !== "undefined" && getCookie("is_logged_in") === "true";

  const [editTitle, setEditTitle] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0.0);
  const [editDescription, setEditDescription] = useState<string>("");
  const [editReleaseDate, setEditReleaseDate] = useState<Date>();
  const [editVideo, setEditVideo] = useState<string>("");
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([]);
  const [editImages, setIEditmages] = useState<
    { id?: number; file?: File; preview: string }[]
  >([]);
  const [editCover, setEditCover] = useState<{
    file: File | null;
    preview: string;
  }>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessageEdit, setErrorMessageEdit] = useState<
    Record<string, string[]>
  >({});

  const router = useRouter();
  const canEdit = fromPanel && game.is_owner;

  // verifico che non sia già in libreria
  const {
    data: library,
    error: libraryError,
    isLoading: libraryLoading,
    mutate,
  } = useSWR(
    isLoggedIn && !fromPanel && game?.title ? `library/${game?.title}/` : null,
  );

  const {
    data: familyLibrary,
    error: familyLibraryError,
    isLoading: familyLibraryLoading,
  } = useSWR(
    isLoggedIn && !fromPanel && game?.title
      ? `api/family/dashboard/games/${game?.title}/`
      : null,
  );

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

      mutate();
      mutateCart("/shopping_cart/?page=1", undefined, { revalidate: true });
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

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        Errore nel caricamento
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 p-0  text-foreground font-sans">
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

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6">
          <div className="flex flex-row justify-between items-end mx-0">
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center w-full sm:w-auto">
                <Label
                  htmlFor="game_cover_input"
                  className={`group relative block ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="w-32 h-44 rounded-xl shadow-2xl border border-border flex-shrink-0 hidden sm:block overflow-hidden relative bg-background">
                    {!isEditing ? (
                      game.cover ? (
                        <Image
                          fill
                          src={game.cover}
                          alt={game.title}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          Senza Cover
                        </div>
                      )
                    ) : editCover?.preview ? (
                      <Image
                        fill
                        src={editCover.preview}
                        alt={editTitle}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        Senza Cover
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded-xl group-hover:ring-2 group-hover:ring-white group-hover:ring-inset">
                        <span className="text-xs text-white font-medium uppercase tracking-wider text-center px-2 select-none pointer-events-none">
                          Cambia
                          <br />
                          Cover
                        </span>
                      </div>
                    )}
                  </div>
                  <ErrorMessage message={errorMessageEdit.cover} />
                </Label>

                {isEditing && (
                  <input
                    id="game_cover_input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setEditCover({
                          file: file,
                          preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {isEditing
                    ? editSelectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border"
                        >
                          {tag}
                        </span>
                      ))
                    : game.tag_list.map((tag) => (
                        <span
                          key={tag.name}
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border"
                        >
                          {tag.name}
                        </span>
                      ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-1 drop-shadow-lg">
                  {isEditing ? editTitle : game.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-xl">
                      {game.stars === 0 ? "NR (Not Rated)" : game.stars}
                    </span>
                    <span className="text-foreground/80">
                      <Star />
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div>
                    {new Date(game.release_date).toLocaleDateString(
                      "it-IT",
                      dateOptions,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {canEdit ? (
                isEditing ? (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleResetEdit}
                      className="hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                    >
                      <X />
                      Annulla
                    </Button>

                    <Button
                      variant="default"
                      disabled={submitLoading}
                      onClick={(e) => handleUpdate(e)}
                      className="shadow-md shadow-primary/10 active:scale-95 transition-transform"
                    >
                      <Check />
                      {submitLoading ? "Salvataggio..." : "Conferma modifiche"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="default" onClick={handleEdit}>
                    {" "}
                    <PenIcon /> Modifica{" "}
                  </Button>
                )
              ) : null}
              {isLoggedIn &&
              ((!libraryLoading && !libraryError && !!library) ||
                (!familyLibraryLoading &&
                  !familyLibraryError &&
                  !!familyLibrary &&
                  !!familyLibrary.game)) ? (
                <Badge variant="secondary">Possiedi questo gioco</Badge>
              ) : null}
              {!isLoggedIn ||
              (libraryError?.status === 404 && !libraryLoading) ||
              (libraryError?.status === 401 && !libraryLoading) ? (
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold gap-3 group transition-all hover:scale-105 shadow-lg shadow-primary/20"
                  type="submit"
                  onClick={() => {
                    if (!isLoggedIn || libraryError?.status == 401) {
                      window.location.href = "/login";
                    } else {
                      handleSubmit(game.title);
                    }
                  }}
                >
                  <span className="tracking-tight">
                    {game.price === 0 ? "GRATIS" : `${game.price}€`}
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
                    <CardContent className="relative aspect-video p-0 bg-muted flex flex-col items-center justify-center">
                      {isEditing ? (
                        <div className="group-hover:ring-2 group-hover:ring-white group-hover:ring-inset w-full h-full p-6 flex flex-col justify-center items-center gap-4 bg-background border-2 border-dashed border-border rounded-xl">
                          <span className="text-sm font-medium text-muted-foreground">
                            Link Video YouTube (Trailer)
                          </span>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={editVideo}
                            onChange={(e) => setEditVideo(e.target.value)}
                            className="w-full max-w-md px-3 py-2 text-sm border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {editVideo && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              Anteprima pronta per il salvataggio
                            </p>
                          )}
                        </div>
                      ) : (
                        game.video && (
                          <iframe
                            src={getYouTubeEmbedUrl(game.video, origin)}
                            title={`Trailer di ${game.title}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full absolute inset-0"
                          />
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
                <ErrorMessage message={errorMessageEdit.video} />
              </CarouselItem>

              {isEditing
                ? editImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card className="overflow-hidden border-none p-0 group relative">
                          <CardContent className="shadow-none border-primary/30! hover:border-primary/60! transition-colors relative aspect-video p-0 flex items-center justify-center bg-background">
                            <Image
                              src={img.preview}
                              alt={`Anteprima galleria ${index}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setIEditmages(
                                  editImages.filter((_, i) => i !== index),
                                );
                              }}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
                              title="Elimina immagine"
                            >
                              <X />
                            </button>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))
                : game.images?.map((image, index) => (
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

              {isEditing && (
                <CarouselItem>
                  <div className="p-1">
                    <label
                      htmlFor="gallery_add_image"
                      className="cursor-pointer block"
                    >
                      <Card className="group-hover:ring-2 shadow-none!  overflow-hidden border-2 border-dashed! border-primary/30! hover:border-primary/60! transition-colors duration-200 p-0">
                        <CardContent className="relative aspect-video p-0 flex flex-col items-center justify-center bg-muted/30 text-muted-foreground hover:text-foreground">
                          <PlusCircleIcon />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Aggiungi Immagine
                          </span>
                        </CardContent>
                      </Card>
                    </label>
                    <input
                      id="gallery_add_image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIEditmages([
                            ...editImages,
                            {
                              file: file,
                              preview: URL.createObjectURL(file),
                            },
                          ]);
                        }
                      }}
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <ErrorMessage message={errorMessageEdit.images} />
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <Card className="w-full max-w-[30%] ">
            <CardHeader>
              <div className="flex gap-5 items-center">
                <Gamepad2 />

                {isEditing ? (
                  <Input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl md:text-5xl font-black text-foreground mb-1 drop-shadow-lg 
             bg-none border border-border rounded-2xl h-auto p-2 md:p-6
              placeholder:text-muted-foreground/50 text-wrap"
                    placeholder="Inserisci il titolo..."
                  />
                ) : (
                  <h1 className="text-xl md:text-5xl font-black text-foreground mb-1 drop-shadow-lg">
                    {game.title}
                  </h1>
                )}
              </div>
              <ErrorMessage message={errorMessageEdit.title} />
              <Separator />
              <CardContent>
                <div className="my-4">
                  <div className="flex gap-5 items-center mb-3">
                    <TagIcon className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                      Tags
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {isEditing ? (
                      <ToggleGroup
                        type="multiple"
                        size="default"
                        variant="outline"
                        spacing={1}
                        className="gap-1"
                        style={{ flexWrap: "wrap" }}
                        id="tag_list"
                        value={editSelectedTags}
                        onValueChange={(e) => setEditSelectedTags(e)}
                      >
                        {isTagListLoading ? (
                          <Spinner />
                        ) : (
                          tagList.map((tag: Tag) => (
                            <ToggleGroupItem
                              className="text-xs bg-secondary text-secondary-foreground px-3 py-1 h-auto rounded-full border border-border font-normal transition-all duration-200 cursor-pointer hover:bg-muted
                   data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary data-[state=on]:font-medium data-[state=on]:shadow-sm"
                              key={tag.name}
                              id={tag.name}
                              name={tag.name}
                              value={tag.name}
                            >
                              {tag.name}
                            </ToggleGroupItem>
                          ))
                        )}
                      </ToggleGroup>
                    ) : (
                      <>
                        {game.tag_list.map((tag) => (
                          <span
                            key={tag.name}
                            className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <ErrorMessage message={errorMessageEdit.tag_list} />
                </div>
                <div className="my-5">
                  <div className="flex gap-5">
                    <Notebook className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                      Descrizione
                    </h2>
                  </div>
                  <div className="mt-3">
                    {isEditing ? (
                      <Textarea
                        name="description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Descrizione ..."
                      />
                    ) : (
                      <>
                        <p> {game.description} </p>
                      </>
                    )}
                  </div>
                  <ErrorMessage message={errorMessageEdit.description} />
                </div>

                {isEditing ? (
                  <div className="my-5">
                    <div className="flex gap-5">
                      <Banknote className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                        Prezzo
                      </h2>
                    </div>
                    <div className="mt-3">
                      {isEditing ? (
                        <Input
                          id="price"
                          name="price"
                          placeholder="70.0"
                          type="number"
                          value={editPrice}
                          onChange={(e) => {
                            const float_value = parseFloat(e.target.value);
                            setEditPrice(
                              float_value >= 0 && !Number.isNaN(float_value)
                                ? float_value
                                : 0.0,
                            );
                          }}
                        />
                      ) : (
                        <>
                          <p> {game.price} </p>
                        </>
                      )}
                    </div>
                    <ErrorMessage message={errorMessageEdit.price} />
                  </div>
                ) : null}

                <div className="my-5">
                  <div className="flex gap-5">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                      Data di rilascio
                    </h2>
                  </div>
                  <div className="mt-3">
                    {isEditing ? (
                      <Field>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              data-empty={!editReleaseDate}
                              className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                            >
                              {editReleaseDate ? (
                                format(editReleaseDate, "PPP")
                              ) : (
                                <span>Seleziona una data</span>
                              )}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editReleaseDate}
                              onSelect={setEditReleaseDate}
                              defaultMonth={editReleaseDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                    ) : (
                      <p>
                        {" "}
                        {new Date(game.release_date).toLocaleDateString(
                          "it-IT",
                          dateOptions,
                        )}{" "}
                      </p>
                    )}
                  </div>
                  <ErrorMessage message={errorMessageEdit.date} />
                </div>

                <div className="my-5">
                  <div className="flex gap-5">
                    <User className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                      Publisher
                    </h2>
                  </div>
                  <p> {game.publisher} </p>
                </div>

                <Separator className="opacity-80 my-1" />

                <div className="my-5 flex items-center justify-between bg-muted/40 p-3 rounded-2xl border border-border/50 shadow-inner">
                  <div className="flex gap-5">
                    <h1 className="text-xl md:text-xl font-black text-foreground drop-shadow-lg">
                      {game.stars === 0 ? "NR" : game.stars}
                    </h1>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i + 1 <= game.stars
                            ? "fill-violet-500 text-violet-500"
                            : "text-slate-300 dark:text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-10">
          <ReviewSection params={{ gameTitle: game.title }} />
        </div>
      </div>
    </div>
  );
}
